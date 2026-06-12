'use client';

import { useAccountStore, TransactionData } from '@/store/useAccountStore';
import { useEffect, useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  X,
  PlusCircle
} from 'lucide-react';

export default function SpendingPage() {
  const { accounts, transactions, addTransaction, deleteTransaction, fetchAccounts, fetchTransactions } = useAccountStore();
  const [mounted, setMounted] = useState(false);

  // Form State
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  // Filter State
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    fetchAccounts();
    fetchTransactions();
  }, [fetchAccounts, fetchTransactions]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('openForm') === 'true') {
        setIsOpenForm(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Set default account on load
  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0]._id || '');
    }
  }, [accounts, accountId]);

  if (!mounted) {
    return <div style={{ color: 'var(--text-secondary)' }}>Đang tải phân hệ chi tiêu...</div>;
  }

  // Categories list
  const categories = type === 'income' 
    ? ['Lương', 'Kinh doanh', 'Đầu tư', 'Thưởng', 'Được cho/tặng', 'Khác']
    : type === 'expense' 
    ? ['Ăn uống', 'Mua sắm', 'Di chuyển', 'Nhà cửa/Thuê nhà', 'Hóa đơn', 'Giải trí', 'Y tế', 'Giáo dục', 'Khác']
    : ['Chuyển tiền ví/ngân hàng'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !amount || !category) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      await addTransaction({
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        type,
        amount: Number(amount),
        category,
        date: new Date(date).toISOString(),
        description
      });

      // Reset Form
      setAmount('');
      setCategory('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsOpenForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa giao dịch này? Số dư tài khoản liên quan sẽ được tự động hoàn tác.')) {
      await deleteTransaction(id);
    }
  };

  // Filter logic
  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesAccount = filterAccount === 'all' || t.accountId === filterAccount || t.toAccountId === filterAccount;
    const matchesSearch = searchQuery === '' || 
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesAccount && matchesSearch;
  });

  // Calculation for summary cards of filtered list
  const totalFilteredIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--color-income)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>THU NHẬP (Bộ lọc)</p>
          <h3 style={{ color: 'var(--color-income)', fontSize: '1.4rem', marginTop: '6px' }}>+{formatVND(totalFilteredIncome)}</h3>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--color-expense)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>CHI TIÊU (Bộ lọc)</p>
          <h3 style={{ color: 'var(--color-expense)', fontSize: '1.4rem', marginTop: '6px' }}>-{formatVND(totalFilteredExpense)}</h3>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>THẶNG DƯ RÒNG</p>
          <h3 style={{ color: totalFilteredIncome - totalFilteredExpense >= 0 ? 'var(--color-income)' : 'var(--color-expense)', fontSize: '1.4rem', marginTop: '6px' }}>
            {totalFilteredIncome - totalFilteredExpense >= 0 ? '+' : ''}{formatVND(totalFilteredIncome - totalFilteredExpense)}
          </h3>
        </div>
      </div>

      {/* Mobile Add Transaction Floating Action Button */}
      <button 
        className="btn btn-primary flex-center mobile-only-btn" 
        onClick={() => setIsOpenForm(true)}
        style={{ display: 'none', gap: '8px', zIndex: 80 }}
      >
        <Plus size={20} />
        Thêm giao dịch mới
      </button>

      {/* Main Layout Grid */}
      <div className="spending-layout">
        
        {/* Left Column: Filters and Transaction list */}
        <div className="spending-main-panel">
          
          {/* Filters Bar */}
          <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="flex-between">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ fontWeight: 600 }}>Bộ lọc giao dịch</span>
              </div>
            </div>
            
            <div className="filters-grid">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Loại giao dịch</label>
                <select 
                  className="form-input" 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                >
                  <option value="all">Tất cả các loại</option>
                  <option value="income">Thu nhập (+)</option>
                  <option value="expense">Chi tiêu (-)</option>
                  <option value="transfer">Chuyển tiền</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Tài khoản ví</label>
                <select 
                  className="form-input" 
                  value={filterAccount} 
                  onChange={(e) => setFilterAccount(e.target.value)}
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                >
                  <option value="all">Tất cả tài khoản</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                <label className="form-label">Tìm kiếm ghi chú/danh mục</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Nhập từ khóa tìm kiếm..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Danh sách giao dịch ({filteredTransactions.length})</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '550px' }}>
              {filteredTransactions.length === 0 ? (
                <div className="flex-center" style={{ flexDirection: 'column', padding: '60px 0', gap: '12px', color: 'var(--text-muted)' }}>
                  <span>Không tìm thấy giao dịch nào phù hợp.</span>
                </div>
              ) : (
                filteredTransactions.map((t) => (
                  <div key={t._id} className="transaction-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        padding: '10px', 
                        borderRadius: 'var(--radius-full)', 
                        background: t.type === 'income' ? 'rgba(16, 185, 129, 0.12)' : t.type === 'expense' ? 'rgba(244, 63, 94, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                        color: t.type === 'income' ? 'var(--color-income)' : t.type === 'expense' ? 'var(--color-expense)' : 'var(--accent-primary)'
                      }}>
                        {t.type === 'income' ? <ArrowUpRight size={18} /> : t.type === 'expense' ? <ArrowDownRight size={18} /> : <TrendingUp size={18} />}
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.98rem' }}>{t.category}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {t.accountName} {t.toAccountName && `→ ${t.toAccountName}`} • {new Date(t.date).toLocaleDateString('vi-VN')}
                        </span>
                        {t.description && (
                          <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            {t.description}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ 
                        fontWeight: 700, 
                        color: t.type === 'income' ? 'var(--color-income)' : t.type === 'expense' ? 'var(--color-expense)' : 'var(--accent-primary)'
                      }}>
                        {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}{formatVND(t.amount)}
                      </span>
                      
                      <button 
                        onClick={() => t._id && handleDelete(t._id)}
                        className="delete-btn"
                        style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Desktop Add Transaction Form / Mobile Modal overlay */}
        <div className={`spending-side-panel ${isOpenForm ? 'active' : ''}`}>
          <div className="glass-card" style={{ position: 'sticky', top: 'calc(var(--header-height) + 24px)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="flex-between">
              <h3 style={{ fontSize: '1.15rem' }}>Thêm giao dịch</h3>
              <button className="close-form-btn" onClick={() => setIsOpenForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Loại giao dịch</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <button 
                    type="button" 
                    className={`btn ${type === 'expense' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '8px', fontSize: '0.85rem' }}
                    onClick={() => { setType('expense'); setCategory(''); }}
                  >
                    Chi tiêu
                  </button>
                  <button 
                    type="button" 
                    className={`btn ${type === 'income' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '8px', fontSize: '0.85rem' }}
                    onClick={() => { setType('income'); setCategory(''); }}
                  >
                    Thu nhập
                  </button>
                  <button 
                    type="button" 
                    className={`btn ${type === 'transfer' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '8px', fontSize: '0.85rem' }}
                    onClick={() => { setType('transfer'); setCategory('Chuyển khoản'); }}
                  >
                    Chuyển ví
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  {type === 'transfer' ? 'Tài khoản nguồn' : 'Tài khoản thanh toán'}
                </label>
                {accounts.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-expense)' }}>
                    Bạn cần tạo tài khoản ví trước ở tab "Quản lý Tiền".
                  </p>
                ) : (
                  <select 
                    className="form-input"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    required
                  >
                    {accounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>{acc.name} ({formatVND(acc.balance)})</option>
                    ))}
                  </select>
                )}
              </div>

              {type === 'transfer' && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Tài khoản nhận</label>
                  <select 
                    className="form-input"
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    required
                  >
                    <option value="">-- Chọn tài khoản nhận --</option>
                    {accounts.map((acc) => (
                      <option key={acc._id} value={acc._id} disabled={acc._id === accountId}>
                        {acc.name} ({formatVND(acc.balance)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Số tiền (VND)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Ví dụ: 50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  required
                />
              </div>

              {type !== 'transfer' && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Danh mục</label>
                  <select 
                    className="form-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Ngày giao dịch</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Ghi chú (Tùy chọn)</label>
                <textarea 
                  className="form-input" 
                  placeholder="Ghi chú chi tiết..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '8px' }}
                disabled={accounts.length === 0}
              >
                Xác nhận
              </button>

            </form>
          </div>
        </div>

      </div>

      <style jsx global>{`
        .spending-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .spending-main-panel {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          transition: all var(--transition-fast);
        }

        .transaction-item:hover {
          border-color: var(--border-color-hover);
          background: rgba(255, 255, 255, 0.04);
        }

        .delete-btn {
          opacity: 0.3;
          transition: opacity var(--transition-fast), color var(--transition-fast);
        }

        .transaction-item:hover .delete-btn {
          opacity: 1;
        }

        .delete-btn:hover {
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
          .spending-layout {
            grid-template-columns: 1fr;
          }

          .spending-side-panel {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100vw;
            height: 85vh;
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

          .spending-side-panel.active {
            transform: translateY(0);
            box-shadow: 0 -8px 32px rgba(0,0,0,0.5);
          }

          .spending-side-panel .glass-card {
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
        }

        @media (max-width: 768px) {
          .filters-grid {
            grid-template-columns: 1fr !important;
            gap: 10px;
          }
          .transaction-item {
            padding: 12px 14px !important;
            border-radius: var(--radius-md) !important;
          }
          .delete-btn {
            opacity: 1 !important;
          }
        }
      `}</style>

    </div>
  );
}
