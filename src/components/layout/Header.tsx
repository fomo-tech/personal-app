'use client';

import { usePathname } from 'next/navigation';
import { useAccountStore } from '@/store/useAccountStore';
import { useGoldStore } from '@/store/useGoldStore';
import { useUIStore } from '@/store/useUIStore';
import { useEffect, useState, useRef } from 'react';
import { 
  Sun, 
  Moon, 
  ChevronDown, 
  PlusCircle, 
  CreditCard, 
  Wallet, 
  Gem, 
  CheckSquare 
} from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const pathname = usePathname();
  const accounts = useAccountStore((state) => state.accounts);
  const goldHoldings = useGoldStore((state) => state.goldHoldings);
  const fetchAccounts = useAccountStore((state) => state.fetchAccounts);
  const fetchGoldHoldings = useGoldStore((state) => state.fetchGoldHoldings);
  const { theme, toggleTheme } = useUIStore();

  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchAccounts();
    fetchGoldHoldings();
  }, [fetchAccounts, fetchGoldHoldings]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Determine Title
  const getTitle = () => {
    switch (pathname) {
      case '/':
        return 'Bảng tổng quan';
      case '/spending':
        return 'Quản lý Chi tiêu';
      case '/money':
        return 'Quản lý Tài khoản Tiền';
      case '/gold':
        return 'Quản lý Tài sản Vàng';
      case '/tasks':
        return 'Quản lý Công việc';
      default:
        return 'Bảng quản lý';
    }
  };

  // Calculations
  const totalMoney = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const totalGoldVal = goldHoldings.reduce((sum, gold) => sum + ((gold.quantity || 0) * (gold.currentPrice || 0)), 0);

  // Formatting helper
  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (!mounted) {
    return (
      <header className="header">
        <h2 className="header-title">{getTitle()}</h2>
      </header>
    );
  }

  return (
    <header className="header">
      
      {/* Title & Theme Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h2 className="header-title">{getTitle()}</h2>
        <button 
          onClick={toggleTheme} 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            cursor: 'pointer', 
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            padding: '8px',
            borderRadius: '50%',
            transition: 'background var(--transition-fast)'
          }}
          title="Chuyển đổi giao diện Sáng/Tối"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={20} style={{ color: 'var(--color-gold)' }} /> : <Moon size={20} style={{ color: 'var(--accent-primary)' }} />}
        </button>
      </div>

      {/* Header Stat summaries for PC View */}
      <div className="header-summary">
        <div className="header-stat">
          <span className="header-stat-label">Tiền mặt & Ví</span>
          <span className="header-stat-value" style={{ color: 'var(--color-income)' }}>
            {formatVND(totalMoney)}
          </span>
        </div>
        
        <div className="header-stat">
          <span className="header-stat-label">Vàng nắm giữ</span>
          <span className="header-stat-value" style={{ color: 'var(--color-gold)' }}>
            {formatVND(totalGoldVal)}
          </span>
        </div>

        <div className="header-stat">
          <span className="header-stat-label">Tổng Tài sản</span>
          <span className="header-stat-value" style={{ color: 'var(--accent-primary)' }}>
            {formatVND(totalMoney + totalGoldVal)}
          </span>
        </div>
      </div>

      {/* Header Right Actions Menu */}
      <div className="header-right">
        
        {/* Quick Actions Dropdown */}
        <div className="quick-actions-container" ref={dropdownRef}>
          <button 
            className="btn btn-secondary flex-center"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ 
              padding: '8px 14px', 
              fontSize: '0.875rem', 
              borderRadius: 'var(--radius-full)',
              gap: '6px'
            }}
          >
            <PlusCircle size={16} style={{ color: 'var(--accent-primary)' }} />
            <span>Thêm Nhanh</span>
            <ChevronDown size={14} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {dropdownOpen && (
            <div className="quick-actions-dropdown">
              <Link 
                href="/spending?openForm=true" 
                className="quick-actions-item"
                onClick={() => setDropdownOpen(false)}
              >
                <CreditCard size={16} style={{ color: 'var(--color-expense)' }} />
                <span>Thêm giao dịch Chi tiêu</span>
              </Link>
              <Link 
                href="/money?openForm=true" 
                className="quick-actions-item"
                onClick={() => setDropdownOpen(false)}
              >
                <Wallet size={16} style={{ color: 'var(--color-income)' }} />
                <span>Thêm tài khoản ví mới</span>
              </Link>
              <Link 
                href="/gold?openForm=true" 
                className="quick-actions-item"
                onClick={() => setDropdownOpen(false)}
              >
                <Gem size={16} style={{ color: 'var(--color-gold)' }} />
                <span>Thêm giao dịch Vàng</span>
              </Link>
              <div className="quick-actions-divider" />
              <Link 
                href="/tasks?openForm=true" 
                className="quick-actions-item"
                onClick={() => setDropdownOpen(false)}
              >
                <CheckSquare size={16} style={{ color: 'var(--color-task)' }} />
                <span>Thêm công việc mới</span>
              </Link>
            </div>
          )}
        </div>

        {/* User Profile Badge */}
        <div className="profile-badge">
          <div className="profile-avatar">TL</div>
          <div className="profile-info">
            <span className="profile-name">Thành Lộc</span>
            <span className="profile-tag">Premium</span>
          </div>
        </div>

      </div>

    </header>
  );
}
