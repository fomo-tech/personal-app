'use client';

import { useAccountStore } from '@/store/useAccountStore';
import { useEffect, useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Wallet, 
  Building2, 
  Smartphone,
  Info,
  X
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';

export default function MoneyPage() {
  const { accounts, addAccount, deleteAccount, fetchAccounts } = useAccountStore();
  const [mounted, setMounted] = useState(false);

  // Form State
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'cash' | 'bank' | 'e-wallet'>('bank');
  const [balance, setBalance] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAccounts();
  }, [fetchAccounts]);

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
    return <div style={{ color: 'var(--text-secondary)' }}>Đang tải phân hệ tài khoản...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addAccount({
        name,
        type,
        balance: Number(balance) || 0
      });
      // Reset
      setName('');
      setBalance('');
      setIsOpenForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('CẢNH BÁO: Xóa tài khoản sẽ xóa TOÀN BỘ lịch sử giao dịch liên quan tới tài khoản này. Bạn có chắc chắn muốn xóa?')) {
      await deleteAccount(id);
    }
  };

  // Helper to format VND
  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Icon selector based on account type
  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'cash':
        return <Wallet size={24} style={{ color: 'var(--color-income)' }} />;
      case 'bank':
        return <Building2 size={24} style={{ color: 'var(--accent-primary)' }} />;
      case 'e-wallet':
        return <Smartphone size={24} style={{ color: 'var(--color-task)' }} />;
      default:
        return <Wallet size={24} />;
    }
  };

  const getAccountTypeName = (type: string) => {
    switch (type) {
      case 'cash': return 'Tiền mặt';
      case 'bank': return 'Tài khoản ngân hàng';
      case 'e-wallet': return 'Ví điện tử';
      default: return 'Khác';
    }
  };

  // Chart Data preparation
  const chartData = accounts.map(acc => ({
    name: acc.name,
    value: Math.max(0, acc.balance) // only positive balance in chart to avoid errors
  })).filter(item => item.value > 0);

  // Colors for Pie chart cells
  const COLORS = ['#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#3b82f6', '#ec4899', '#14b8a6'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Mobile Floating Action Button */}
      <button 
        className="btn btn-primary flex-center mobile-only-btn" 
        onClick={() => setIsOpenForm(true)}
        style={{ display: 'none', gap: '8px', zIndex: 80 }}
      >
        <Plus size={20} />
        Thêm tài khoản
      </button>

      <div className="money-layout">
        
        {/* Left Section: Account List and Distribution Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', flex: 1 }}>
          
          {/* Pie Chart Distribution */}
          {accounts.length > 0 && chartData.length > 0 && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Cơ cấu phân bổ tài sản tiền mặt</h3>
              <div style={{ width: '100%', height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => formatVND(value)}
                      contentStyle={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <Legend verticalAlign="middle" align="right" layout="vertical" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Accounts Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Tài khoản của bạn ({accounts.length})</h3>
            
            {accounts.length === 0 ? (
              <div className="glass-card flex-center" style={{ padding: '60px 0', flexDirection: 'column', gap: '12px', color: 'var(--text-muted)' }}>
                <Info size={32} />
                <span>Bạn chưa tạo tài khoản nào. Vui lòng tạo tài khoản mới ở form bên cạnh.</span>
              </div>
            ) : (
              <div className="accounts-grid">
                {accounts.map((acc) => (
                  <div key={acc._id} className="glass-card account-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="flex-between">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          padding: '10px', 
                          borderRadius: 'var(--radius-md)',
                          background: acc.type === 'cash' ? 'rgba(16, 185, 129, 0.1)' : acc.type === 'bank' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(139, 92, 246, 0.1)'
                        }}>
                          {getAccountIcon(acc.type)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{acc.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{getAccountTypeName(acc.type)}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => acc._id && handleDelete(acc._id)}
                        className="delete-acc-btn"
                        style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SỐ DƯ HIỆN TẠI</p>
                      <h4 style={{ fontSize: '1.4rem', fontWeight: 700, color: acc.balance >= 0 ? 'var(--text-primary)' : 'var(--color-expense)', marginTop: '4px' }}>
                        {formatVND(acc.balance)}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Section: Add Account Form */}
        <div className={`money-side-panel ${isOpenForm ? 'active' : ''}`}>
          <div className="glass-card" style={{ position: 'sticky', top: 'calc(var(--header-height) + 24px)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="flex-between">
              <h3 style={{ fontSize: '1.15rem' }}>Thêm tài khoản mới</h3>
              <button className="close-form-btn" onClick={() => setIsOpenForm(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Tên tài khoản / Ngân hàng</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ví dụ: Techcombank, Tiền mặt..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Loại tài khoản</label>
                <select 
                  className="form-input"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  required
                >
                  <option value="bank">Tài khoản Ngân hàng</option>
                  <option value="cash">Tiền mặt</option>
                  <option value="e-wallet">Ví điện tử (Momo, ShopeePay...)</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Số dư khởi tạo (VND)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Ví dụ: 1000000"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  min="0"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '8px' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang tạo...' : 'Tạo tài khoản'}
              </button>

            </form>
          </div>
        </div>

      </div>

      <style jsx global>{`
        .money-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 30px;
        }

        .accounts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }

        .account-card {
          transition: border-color var(--transition-normal), transform var(--transition-fast);
        }

        .account-card:hover {
          transform: translateY(-2px);
        }

        .delete-acc-btn {
          opacity: 0.2;
          transition: opacity var(--transition-fast), color var(--transition-fast);
        }

        .account-card:hover .delete-acc-btn {
          opacity: 1;
        }

        .delete-acc-btn:hover {
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
          .money-layout {
            grid-template-columns: 1fr;
          }
          
          .money-side-panel {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100vw;
            height: 75vh;
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

          .money-side-panel.active {
            transform: translateY(0);
            box-shadow: 0 -8px 32px rgba(0,0,0,0.5);
          }

          .money-side-panel .glass-card {
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
      `}</style>

    </div>
  );
}
