'use client';

import { useGoldStore } from '@/store/useGoldStore';
import { useEffect, useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Gem, 
  TrendingUp, 
  TrendingDown, 
  Edit2, 
  Check, 
  X,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function GoldPage() {
  const { goldHoldings, fetchGoldHoldings, addGoldHolding, updateGoldHolding, deleteGoldHolding } = useGoldStore();
  const [mounted, setMounted] = useState(false);

  // Form State
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [goldType, setGoldType] = useState('Vàng nhẫn 9999');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline edit state for current price
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState('');

  useEffect(() => {
    setMounted(true);
    fetchGoldHoldings();
  }, [fetchGoldHoldings]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('openForm') === 'true') {
        setIsOpenForm(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  if (!mounted) {
    return <div style={{ color: 'var(--text-secondary)' }}>Đang tải phân hệ quản lý vàng...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goldType || !quantity || !purchasePrice || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addGoldHolding({
        goldType,
        quantity: Number(quantity),
        purchasePrice: Number(purchasePrice),
        currentPrice: Number(currentPrice) || Number(purchasePrice),
        purchaseDate: new Date(purchaseDate).toISOString(),
        note
      });
      // Reset
      setQuantity('');
      setPurchasePrice('');
      setCurrentPrice('');
      setNote('');
      setIsOpenForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePrice = async (id: string) => {
    if (!editingPrice || isNaN(Number(editingPrice))) return;
    try {
      await updateGoldHolding(id, { currentPrice: Number(editingPrice) });
      setEditingId(null);
      setEditingPrice('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa số vàng này khỏi danh mục theo dõi?')) {
      await deleteGoldHolding(id);
    }
  };

  // Calculations
  const totalQuantity = goldHoldings.reduce((sum, g) => sum + (g.quantity || 0), 0);
  const totalCost = goldHoldings.reduce((sum, g) => sum + ((g.quantity || 0) * (g.purchasePrice || 0)), 0);
  const totalMarketVal = goldHoldings.reduce((sum, g) => sum + ((g.quantity || 0) * (g.currentPrice || 0)), 0);
  const totalProfit = totalMarketVal - totalCost;
  const profitPercentage = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  // Formatting helpers
  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatQuantity = (val: number) => {
    return `${val.toLocaleString('vi-VN')} chỉ`;
  };

  // Chart Data: Compare Cost vs Market Value for each gold type
  const chartData = goldHoldings.map(g => ({
    name: `${g.goldType} (${g.quantity} chỉ)`,
    'Giá trị mua': (g.quantity || 0) * (g.purchasePrice || 0),
    'Giá trị hiện tại': (g.quantity || 0) * (g.currentPrice || 0)
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Mobile Floating Action Button */}
      <button 
        className="btn btn-primary flex-center mobile-only-btn" 
        onClick={() => setIsOpenForm(true)}
        style={{ display: 'none', gap: '8px', zIndex: 80 }}
      >
        <Plus size={20} />
        Thêm giao dịch Vàng
      </button>

      {/* 1. Gold Metrics Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="glass-card">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>TỔNG KHỐI LƯỢNG</p>
          <h3 style={{ fontSize: '1.4rem', marginTop: '6px', color: 'var(--color-gold)' }}>{formatQuantity(totalQuantity)}</h3>
        </div>
        <div className="glass-card">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>TỔNG VỐN ĐẦU TƯ</p>
          <h3 style={{ fontSize: '1.4rem', marginTop: '6px' }}>{formatVND(totalCost)}</h3>
        </div>
        <div className="glass-card">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>GIÁ TRỊ HIỆN TẠI</p>
          <h3 style={{ fontSize: '1.4rem', marginTop: '6px', color: 'var(--accent-primary)' }}>{formatVND(totalMarketVal)}</h3>
        </div>
        <div className="glass-card" style={{ borderLeft: totalProfit >= 0 ? '4px solid var(--color-income)' : '4px solid var(--color-expense)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>TỔNG LÃI/LỖ</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <h3 style={{ 
              fontSize: '1.4rem', 
              color: totalProfit >= 0 ? 'var(--color-income)' : 'var(--color-expense)'
            }}>
              {totalProfit >= 0 ? '+' : ''}{formatVND(totalProfit)}
            </h3>
            <span style={{ 
              fontSize: '0.85rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              background: totalProfit >= 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
              color: totalProfit >= 0 ? 'var(--color-income)' : 'var(--color-expense)'
            }}>
              {totalProfit >= 0 ? '+' : ''}{profitPercentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. Visual Chart & Input Grid */}
      <div className="gold-layout">
        
        {/* Left column: Chart and Holdings Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', flex: 1 }}>
          
          {/* Cost vs Market Value Chart */}
          {goldHoldings.length > 0 && (
            <div className="glass-card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>So sánh Giá trị mua và Giá trị hiện tại</h3>
              <div style={{ width: '100%', height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} />
                    <Tooltip 
                      formatter={(value: any) => formatVND(value)}
                      contentStyle={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Giá trị mua" fill="var(--text-muted)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Giá trị hiện tại" fill="var(--color-gold)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Gold Holdings List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Chi tiết danh mục nắm giữ ({goldHoldings.length})</h3>
            
            {goldHoldings.length === 0 ? (
              <div className="glass-card flex-center" style={{ padding: '60px 0', flexDirection: 'column', gap: '12px', color: 'var(--text-muted)' }}>
                <Info size={32} />
                <span>Chưa có thông tin nắm giữ vàng. Thêm giao dịch mua vàng mới ở biểu mẫu kế bên.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {goldHoldings.map((gold) => {
                  const buyVal = (gold.quantity || 0) * (gold.purchasePrice || 0);
                  const currentVal = (gold.quantity || 0) * (gold.currentPrice || 0);
                  const holdingProfit = currentVal - buyVal;
                  const holdingProfitPct = buyVal > 0 ? (holdingProfit / buyVal) * 100 : 0;

                  return (
                    <div key={gold._id} className="glass-card gold-card">
                      <div className="gold-card-header flex-between">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ padding: '8px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', color: 'var(--color-gold)' }}>
                            <Gem size={20} />
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{gold.goldType}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '12px' }}>
                              Mua ngày: {new Date(gold.purchaseDate).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>

                        <button 
                          onClick={() => gold._id && handleDelete(gold._id)}
                          className="delete-gold-btn"
                          style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="gold-card-body">
                        <div>
                          <p className="card-label">KHỐI LƯỢNG</p>
                          <p className="card-value">{formatQuantity(gold.quantity)}</p>
                        </div>
                        <div>
                          <p className="card-label">GIÁ MUA</p>
                          <p className="card-value">{formatVND(gold.purchasePrice)}<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/chỉ</span></p>
                        </div>
                        
                        {/* Current Price Column with inline edit */}
                        <div>
                          <p className="card-label">GIÁ THỊ TRƯỜNG HIỆN TẠI</p>
                          {editingId === gold._id ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                              <input 
                                type="number" 
                                className="form-input" 
                                value={editingPrice}
                                onChange={(e) => setEditingPrice(e.target.value)}
                                style={{ width: '120px', padding: '6px 10px', fontSize: '0.9rem' }}
                                placeholder="Giá VND/chỉ"
                                autoFocus
                              />
                              <button 
                                onClick={() => handleUpdatePrice(gold._id!)}
                                className="btn btn-primary"
                                style={{ padding: '6px 10px' }}
                              >
                                <Check size={14} />
                              </button>
                              <button 
                                onClick={() => setEditingId(null)}
                                className="btn btn-secondary"
                                style={{ padding: '6px 10px' }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                              <p className="card-value" style={{ color: 'var(--color-gold)' }}>
                                {formatVND(gold.currentPrice)}<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/chỉ</span>
                              </p>
                              <button 
                                onClick={() => {
                                  setEditingId(gold._id!);
                                  setEditingPrice(gold.currentPrice.toString());
                                }}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                                title="Cập nhật giá thị trường"
                              >
                                <Edit2 size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="gold-card-footer flex-between">
                        <div>
                          <p className="card-label">ĐỊNH GIÁ DANH MỤC</p>
                          <p style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                            {formatVND(currentVal)} 
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '8px' }}>
                              (Vốn: {formatVND(buyVal)})
                            </span>
                          </p>
                        </div>

                        <div className="flex-center" style={{ gap: '8px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Lợi nhuận:</span>
                          <span style={{ 
                            fontWeight: 700, 
                            color: holdingProfit >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {holdingProfit >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {holdingProfit >= 0 ? '+' : ''}{holdingProfitPct.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      {gold.note && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', marginTop: '12px', paddingTop: '8px', fontStyle: 'italic' }}>
                          Ghi chú: {gold.note}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right column: Form */}
        <div className={`gold-side-panel ${isOpenForm ? 'active' : ''}`}>
          <div className="glass-card" style={{ position: 'sticky', top: 'calc(var(--header-height) + 24px)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="flex-between">
              <h3 style={{ fontSize: '1.15rem' }}>Thêm giao dịch Vàng</h3>
              <button className="close-form-btn" onClick={() => setIsOpenForm(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Loại Vàng</label>
                <select 
                  className="form-input"
                  value={goldType}
                  onChange={(e) => setGoldType(e.target.value)}
                  required
                >
                  <option value="Vàng nhẫn 9999">Vàng nhẫn 9999 (Nhẫn tròn trơn)</option>
                  <option value="Vàng SJC">SJC (Vàng miếng)</option>
                  <option value="Vàng PNJ">Vàng PNJ</option>
                  <option value="Vàng 24K">Vàng 24K (99.9%)</option>
                  <option value="Vàng 18K">Vàng 18K (75%)</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Khối lượng (Chỉ - Ví dụ: 1.5, 2)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-input" 
                  placeholder="Nhập số chỉ..."
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0.01"
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Giá mua (VND / Chỉ)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Ví dụ: 7800000"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Giá thị trường hiện tại (Tùy chọn, VND / Chỉ)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Mặc định bằng giá mua nếu để trống"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  min="1"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Ngày mua</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Ghi chú (Tùy chọn)</label>
                <textarea 
                  className="form-input" 
                  placeholder="Nơi mua, hóa đơn..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '8px' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang thêm...' : 'Thêm giao dịch'}
              </button>

            </form>
          </div>
        </div>

      </div>

      <style jsx global>{`
        .gold-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 30px;
        }

        .gold-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
          border-left: 3px solid var(--color-gold);
        }

        .gold-card-body {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          padding: 16px 0;
        }

        .card-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .card-value {
          font-size: 1.1rem;
          font-weight: 700;
          margin-top: 4px;
        }

        .delete-gold-btn {
          opacity: 0.2;
          transition: opacity var(--transition-fast), color var(--transition-fast);
        }

        .gold-card:hover .delete-gold-btn {
          opacity: 1;
        }

        .delete-gold-btn:hover {
          color: var(--color-expense) !important;
        }

        .close-form-btn {
          display: none;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
        }

        @media (max-width: 992px) {
          .gold-layout {
            grid-template-columns: 1fr;
          }

          .gold-side-panel {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100vw;
            height: 78vh;
            background: var(--bg-secondary);
            border-top: 1px solid var(--border-color);
            border-top-left-radius: var(--radius-lg);
            border-top-right-radius: var(--radius-lg);
            z-index: 150;
            transform: translateY(100%);
            transition: transform var(--transition-normal);
            overflow-y: auto;
            padding-bottom: env(safe-area-inset-bottom, 0px);
          }

          .gold-side-panel.active {
            transform: translateY(0);
            box-shadow: 0 -8px 32px rgba(0,0,0,0.5);
          }

          .gold-side-panel .glass-card {
            border: none;
            box-shadow: none;
            background: transparent;
            padding: 24px;
            backdrop-filter: none;
          }

          .close-form-btn {
            display: block;
          }

          .mobile-only-btn {
            display: flex !important;
            position: fixed;
            bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px) + 16px);
            right: 16px;
            box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
            border-radius: var(--radius-full);
            padding: 14px 24px;
          }

          .gold-card-body {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .delete-gold-btn {
            opacity: 1 !important;
          }
        }
      `}</style>

    </div>
  );
}
