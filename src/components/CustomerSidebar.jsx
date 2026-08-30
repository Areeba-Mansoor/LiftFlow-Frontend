import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LifeBuoy, LogOut } from 'lucide-react';

export default function CustomerSidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col justify-between p-6 fixed inset-y-0 z-10">
      <div className="space-y-6">
        {/* App Branding */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <LifeBuoy size={22} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Water Support</h2>
            <p className="text-[10px] text-gray-400">Customer Portal</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <a href="#" className="flex items-center gap-3 px-3.5 py-2.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-semibold">
            <LayoutDashboard size={18} />
            Dashboard
          </a>
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-gray-800 truncate">{user?.name || 'Customer'}</h4>
            <p className="text-[10px] text-gray-400 truncate">{user?.email || 'customer@app.com'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer border border-red-200"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}