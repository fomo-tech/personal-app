'use client';

import { useAccountStore } from '@/store/useAccountStore';
import { useGoldStore } from '@/store/useGoldStore';
import { useTaskStore } from '@/store/useTaskStore';
import { useEffect, useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Gem, 
  CheckCircle, 
  TrendingUp, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import Link from 'next/link';

export default function DashboardPage() {
  const { accounts, transactions } = useAccountStore();
  const { goldHoldings } = useGoldStore();
  const { tasks } = useTaskStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ color: 'var(--text-secondary)' }}>Đang chuẩn bị bảng điều khiển...</div>
    );
  }

  // Formatting helpers
  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Financial calculations
  const totalMoney = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalGoldVal = goldHoldings.reduce((sum, g) => sum + ((g.quantity || 0) * (g.currentPrice || 0)), 0);
  const totalGoldInvested = goldHoldings.reduce((sum, g) => sum + ((g.quantity || 0) * (g.purchasePrice || 0)), 0);
  const netWorth = totalMoney + totalGoldVal;
  const goldProfit = totalGoldVal - totalGoldInvested;

  // Monthly income & expense calculations for Chart
  const getChartData = () => {
    const monthlyData: { [key: string]: { income: number; expense: number } } = {};
    
    // Sort transactions chronologically
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Get last 6 months
    sorted.forEach((t) => {
      if (!t.date) return;
      const d = new Date(t.date);
      const monthYear = `${d.getMonth() + 1}/${d.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { income: 0, expense: 0 };
      }
      
      if (t.type === 'income') {
        monthlyData[monthYear].income += t.amount;
      } else if (t.type === 'expense') {
        monthlyData[monthYear].expense += t.amount;
      }
    });

    const chartArray = Object.keys(monthlyData).map(key => ({
      name: key,
      'Thu nhập': monthlyData[key].income,
      'Chi tiêu': monthlyData[key].expense
    }));

    // If no data, return mock structure for visual preview
    if (chartArray.length === 0) {
      return [
        { name: 'Tháng 1', 'Thu nhập': 5000000, 'Chi tiêu': 3200000 },
        { name: 'Tháng 2', 'Thu nhập': 8000000, 'Chi tiêu': 4500000 },
        { name: 'Tháng 3', 'Thu nhập': 6000000, 'Chi tiêu': 5100000 },
        { name: 'Tháng 4', 'Thu nhập': 12000000, 'Chi tiêu': 6800000 },
        { name: 'Tháng 5', 'Thu nhập': 9500000, 'Chi tiêu': 5800000 },
        { name: 'Tháng 6', 'Thu nhập': 15000000, 'Chi tiêu': 7500000 },
      ];
    }
    return chartArray.slice(-6); // show last 6 months
  };

  const chartData = getChartData();

  // Task stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const pendingTasks = totalTasks - completedTasks;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  // Recent 5 tasks
  const activeTasks = tasks.filter(t => t.status !== 'done').slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* 1. Quick Stats Grid */}
      <div className="grid-cols-dashboard">
        
        {/* Net Worth Card */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            padding: '12px', 
            borderRadius: 'var(--radius-md)', 
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--accent-primary)'
          }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>TỔNG TÀI SẢN RÒNG</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '4px' }}>{formatVND(netWorth)}</h3>
          </div>
        </div>

        {/* Money Card */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            padding: '12px', 
            borderRadius: 'var(--radius-md)', 
            background: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--color-income)'
          }}>
            <Wallet size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>TIỀN MẶT & TÀI KHOẢN</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '4px' }}>{formatVND(totalMoney)}</h3>
          </div>
        </div>

        {/* Gold Card */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            padding: '12px', 
            borderRadius: 'var(--radius-md)', 
            background: 'rgba(245, 158, 11, 0.15)',
            color: 'var(--color-gold)'
          }}>
            <Gem size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>GIÁ TRỊ TÀI SẢN VÀNG</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '4px' }}>{formatVND(totalGoldVal)}</h3>
            <p style={{ fontSize: '0.75rem', color: goldProfit >= 0 ? 'var(--color-income)' : 'var(--color-expense)', marginTop: '2px' }}>
              {goldProfit >= 0 ? 'Lãi: ' : 'Lỗ: '} {formatVND(Math.abs(goldProfit))}
            </p>
          </div>
        </div>

        {/* Tasks Card */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            padding: '12px', 
            borderRadius: 'var(--radius-md)', 
            background: 'rgba(139, 92, 246, 0.15)',
            color: 'var(--color-task)'
          }}>
            <CheckCircle size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>TIẾN ĐỘ CÔNG VIỆC</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '4px' }}>{taskProgress}%</h3>
            <div style={{ width: '100%', height: '6px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${taskProgress}%`, height: '100%', background: 'var(--color-task)', transition: 'width 0.5s ease' }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {completedTasks}/{totalTasks} công việc hoàn thành
            </p>
          </div>
        </div>

      </div>

      {/* 2. Visual Graphs & Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
        <div className="glass-card" style={{ minHeight: '350px' }}>
          <div className="flex-between" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Biểu đồ Chi tiêu & Thu nhập</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>6 tháng gần nhất</span>
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expenseColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--bg-secondary)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)' 
                  }} 
                />
                <Legend />
                <Area type="monotone" dataKey="Thu nhập" stroke="var(--color-income)" fillOpacity={1} fill="url(#incomeColor)" />
                <Area type="monotone" dataKey="Chi tiêu" stroke="var(--color-expense)" fillOpacity={1} fill="url(#expenseColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Tables & Secondary Overviews */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        
        {/* Recent Financial Transactions */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-between">
            <h3 style={{ fontSize: '1.15rem' }}>Giao dịch gần đây</h3>
            <Link href="/spending" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
              Xem tất cả
            </Link>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '300px' }}>
            {recentTransactions.length === 0 ? (
              <div className="flex-center" style={{ flex: 1, padding: '40px 0', flexDirection: 'column', gap: '8px' }}>
                <AlertCircle size={24} style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Chưa có giao dịch phát sinh.</span>
              </div>
            ) : (
              recentTransactions.map((t) => (
                <div key={t._id} className="flex-between" style={{ 
                  padding: '12px 16px', 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.category}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {t.accountName} • {new Date(t.date).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                    {t.type === 'income' ? (
                      <span style={{ color: 'var(--color-income)' }}>+{formatVND(t.amount)}</span>
                    ) : t.type === 'expense' ? (
                      <span style={{ color: 'var(--color-expense)' }}>-{formatVND(t.amount)}</span>
                    ) : (
                      <span style={{ color: 'var(--color-task)' }}>{formatVND(t.amount)}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Todo Tasks */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex-between">
            <h3 style={{ fontSize: '1.15rem' }}>Công việc chưa hoàn thành</h3>
            <Link href="/tasks" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
              Xem tất cả
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '300px' }}>
            {activeTasks.length === 0 ? (
              <div className="flex-center" style={{ flex: 1, padding: '40px 0', flexDirection: 'column', gap: '8px' }}>
                <CheckCircle size={24} style={{ color: 'var(--color-income)' }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tuyệt vời! Không còn công việc tồn đọng.</span>
              </div>
            ) : (
              activeTasks.map((task) => (
                <div key={task._id} className="flex-between" style={{ 
                  padding: '12px 16px', 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{task.title}</span>
                    {task.dueDate && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> Hạn chót: {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="badge" style={{ 
                      background: task.priority === 'high' ? 'rgba(244, 63, 94, 0.15)' : task.priority === 'medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: task.priority === 'high' ? 'var(--color-expense)' : task.priority === 'medium' ? 'var(--color-gold)' : 'var(--color-income)',
                      textTransform: 'uppercase'
                    }}>
                      {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
