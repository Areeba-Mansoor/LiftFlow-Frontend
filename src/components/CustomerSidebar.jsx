import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogOut, X } from 'lucide-react';

export default function CustomerSidebar({ isOpen, onClose }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
        flex flex-col justify-between p-6 font-sans select-none
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-6">
          {/* App Branding & Mobile Close Button */}
          <div className="flex items-center justify-between px-3 pt-2">
            <div>
              <p className="text-xl font-black tracking-wide text-gray-900 font-['IBM_Plex_Mono']">
                Lift Fl<span className='text-amber-300 text-3xl'>O</span>w
              </p>
              <p className="text-[13px] text-gray-400 mt-0.5">Customer Portal</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg md:hidden cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <a href="#" onClick={onClose} className="flex items-center gap-3 px-3.5 py-2.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-semibold">
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
    </>
  );
}