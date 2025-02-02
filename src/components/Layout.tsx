import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Store, PackageSearch, LineChart, ShoppingCart, BarChart2, Users, LogOut } from 'lucide-react';
import { Cart } from './Cart';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  onShowSales: () => void;
}

export function Layout({ children, onShowSales }: LayoutProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const { currentUser, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: Store, label: 'POS', roles: ['owner', 'store_manager', 'shopkeeper'] },
    { path: '/products', icon: PackageSearch, label: 'Produk', roles: ['owner', 'store_manager'] },
    { path: '/sales', icon: BarChart2, label: 'Penjualan', roles: ['owner', 'store_manager'] },
    { path: '/employees', icon: Users, label: 'Karyawan', roles: ['owner'] },
  ].filter(item => hasPermission(item.roles));

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Sidebar Navigation */}
      <nav className="w-20 bg-white border-r border-indigo-100 flex flex-col items-center py-6">
        <div className="flex-1 space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`group relative p-3 rounded-xl flex flex-col items-center gap-1 transition-colors ${
                !hasPermission(item.roles) ? 'hidden' : ''
              }`}
            >
              <div
                className={`flex flex-col items-center ${
                  location.pathname === item.path
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                } p-3 rounded-xl`}
              >
                <item.icon size={24} />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
              {/* Tooltip */}
              <div className="absolute invisible group-hover:visible left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap z-[60]">
                {item.label}
              </div>
            </Link>
          ))}
        </div>

        <div className="space-y-4">
          {hasPermission(['owner', 'store_manager']) && (
            <button
              onClick={onShowSales}
              className="group relative p-3 rounded-xl flex flex-col items-center gap-1"
            >
              <div className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 p-3 rounded-xl">
                <LineChart size={24} />
                <span className="text-xs font-medium">Jurnal</span>
              </div>
              {/* Tooltip */}
              <div className="absolute invisible group-hover:visible left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap z-[60]">
                Jurnal Penjualan
              </div>
            </button>
          )}
          
          <button
            onClick={() => setIsCartOpen(true)}
            className="group relative p-3 rounded-xl flex flex-col items-center gap-1"
          >
            <div className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 p-3 rounded-xl">
              <ShoppingCart size={24} />
              <span className="text-xs font-medium">Cart</span>
            </div>
            {/* Tooltip */}
            <div className="absolute invisible group-hover:visible left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap z-[60]">
              Keranjang Belanja
            </div>
          </button>

          <button
            onClick={logout}
            className="group relative p-3 rounded-xl flex flex-col items-center gap-1"
          >
            <div className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 p-3 rounded-xl">
              <LogOut size={24} />
              <span className="text-xs font-medium">Logout</span>
            </div>
            {/* Tooltip */}
            <div className="absolute invisible group-hover:visible left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap z-[60]">
              Keluar
            </div>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* User Info Banner */}
          <div className="bg-white border-b border-indigo-100 p-4">
            <div className="flex items-center justify-end">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">
                  {currentUser?.role === 'owner' ? 'Owner' :
                   currentUser?.role === 'store_manager' ? 'Store Manager' :
                   'Shopkeeper'}
                </p>
              </div>
            </div>
          </div>

          {children}
        </div>
      </main>

      {/* Slide-out Cart */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
