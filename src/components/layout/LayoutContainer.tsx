'use client';

import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import { useEffect, useState } from 'react';
import { useAccountStore } from '@/store/useAccountStore';
import { useGoldStore } from '@/store/useGoldStore';
import { useTaskStore } from '@/store/useTaskStore';
import { useUIStore } from '@/store/useUIStore';

export default function LayoutContainer({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const fetchAccounts = useAccountStore((state) => state.fetchAccounts);
  const fetchTransactions = useAccountStore((state) => state.fetchTransactions);
  const fetchGoldHoldings = useGoldStore((state) => state.fetchGoldHoldings);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const { setTheme } = useUIStore();

  useEffect(() => {
    setMounted(true);
    // Sync theme from localStorage on client side mount
    const savedTheme = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);

    // Pre-fetch general store data on load
    fetchAccounts();
    fetchTransactions();
    fetchGoldHoldings();
    fetchTasks();
  }, [fetchAccounts, fetchTransactions, fetchGoldHoldings, fetchTasks, setTheme]);

  if (!mounted) {
    return (
      <div className="app-wrapper flex-center" style={{ height: '100vh', direction: 'ltr' }}>
        <div className="flex-col flex-center" style={{ gap: '16px' }}>
          <div className="animate-spin" style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid var(--border-color)', 
            borderTopColor: 'var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Đang tải ứng dụng...</p>
        </div>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-container animate-fade-in">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
