import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Wrench, LogOut, CheckSquare, Clock } from 'lucide-react';

export default function WorkerSidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col justify-between p-6 fixed inset-y-0 z-10 font-sans">
      <div className="space-y-6">
        {/* App Branding */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm tracking-wider">
            W
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 leading-tight">Worker Portal</h2>
            <p className="text-[10px] text-gray-400">Field Operations</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <a href="#" className="flex items-center gap-3 px-3.5 py-2.5 bg-amber-50 text-amber-800 rounded-xl text-xs font-semibold">
            <LayoutDashboard size={18} className="text-amber-600" />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-3.5 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl text-xs font-medium transition-colors">
            <Clock size={18} className="text-gray-400" />
            Pending Tasks
          </a>
          <a href="#" className="flex items-center gap-3 px-3.5 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl text-xs font-medium transition-colors">
            <CheckSquare size={18} className="text-gray-400" />
            Completed
          </a>
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'W'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-gray-900 truncate">{user?.name || 'Worker'}</h4>
            <p className="text-[10px] text-gray-400 truncate">{user?.email || 'worker@app.com'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer border border-red-100"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </aside>
  );
}