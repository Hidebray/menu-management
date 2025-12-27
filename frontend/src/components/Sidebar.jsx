// src/components/Sidebar.jsx
import { LayoutDashboard, UtensilsCrossed, Coffee, ShoppingCart, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom'; // Dùng Link của React Router
import { cn } from '../lib/utils'; 

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'categories', label: 'Quản lý Danh mục', icon: UtensilsCrossed, path: '/categories' },
  { id: 'menu', label: 'Quản lý Món ăn', icon: UtensilsCrossed, path: '/menu' },
  { id: 'modifiers', label: 'Modifiers (Topping)', icon: Coffee, path: '/modifiers' },
  { id: 'orders', label: 'Đơn hàng', icon: ShoppingCart, path: '/orders' },
  { id: 'settings', label: 'Cài đặt', icon: Settings, path: '/settings' },
];

export function Sidebar() {
  const location = useLocation(); // Lấy đường dẫn hiện tại để highlight active

  return (
    <div className="w-64 border-r bg-card h-screen sticky top-0 flex flex-col shadow-sm">
      <div className="p-6 border-b flex items-center gap-2">
        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold">
          SR
        </div>
        <h2 className="font-semibold text-lg">Smart Restaurant</h2>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            👤
          </div>
          <div className="text-sm">
            <p className="font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}