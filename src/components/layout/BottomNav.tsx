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

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Tổng quan', href: '/', icon: LayoutDashboard },
    { name: 'Chi tiêu', href: '/spending', icon: CreditCard },
    { name: 'Tài khoản', href: '/money', icon: Wallet },
    { name: 'Vàng', href: '/gold', icon: Gem },
    { name: 'Công việc', href: '/tasks', icon: CheckSquare },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.href}
            href={item.href} 
            className={`bottom-nav-item ${isActive ? 'bottom-nav-item-active' : ''}`}
          >
            <Icon size={20} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
