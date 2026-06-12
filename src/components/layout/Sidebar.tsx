'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CreditCard, 
  Wallet, 
  Gem, 
  CheckSquare 
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Tổng quan', href: '/', icon: LayoutDashboard },
    { name: 'Quản lý Chi tiêu', href: '/spending', icon: CreditCard },
    { name: 'Quản lý Tiền', href: '/money', icon: Wallet },
    { name: 'Quản lý Vàng', href: '/gold', icon: Gem },
    { name: 'Quản lý Công việc', href: '/tasks', icon: CheckSquare },
  ];

  return (
    <aside className="sidebar">
      <div>
        <div className="logo-container">
          <Wallet size={28} className="text-indigo-500" style={{ color: 'var(--accent-primary)' }} />
          <h1 className="logo-text">Personal Manager</h1>
        </div>
        
        <nav>
          <ul className="nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="sidebar-footer">
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Production Edition v1.0
        </p>
      </div>
    </aside>
  );
}
