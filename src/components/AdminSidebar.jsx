import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, Car, Calendar, 
  CreditCard, BarChart2, Tag, MessageSquare, 
  ShieldAlert, Settings, LogOut, X 
} from 'lucide-react';

export default function AdminSidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
        flex flex-col justify-between p-4 font-sans select-none
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-6">
          {/* App Logo & Mobile Close Button */}
          <div className="flex items-center justify-between px-3 pt-2">
            <p className="text-xl font-black tracking-wide text-gray-900 font-serif">
              Lift Fl<span className='text-amber-300 text-3xl'>O</span>w
            </p>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links with Hidden Scrollbar */}
          <nav className="space-y-1 text-xs font-medium text-gray-600 overflow-y-auto max-h-[calc(100vh-180px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <Link to="/admin-dashboard" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50">
              <LayoutDashboard size={18} className="text-gray-500" /> Dashboard
            </Link>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50">
              <Users size={18} className="text-gray-500" /> Users Management
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50">
              <Car size={18} className="text-gray-500" /> Driver Management
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50">
              <Calendar size={18} className="text-gray-500" /> Rides & Reservations
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50">
              <CreditCard size={18} className="text-gray-500" /> Transactions
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50">
              <BarChart2 size={18} className="text-gray-500" /> Analytics
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50">
              <Tag size={18} className="text-gray-500" /> Promotions
            </a>

            {/* Reports Dropdown / Active Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50/60 text-amber-900 font-semibold">
                <div className="flex items-center gap-3">
                  <MessageSquare size={18} className="text-amber-600" /> Reports
                </div>
              </div>
              <div className="pl-9 pr-2 py-1 space-y-1 mt-1 text-[11px] text-gray-500 border-l-2 border-amber-500 ml-4">
                <a href="#" className="block py-1.5 font-semibold text-amber-700">Support Overview</a>
                <a href="#" className="block py-1.5 hover:text-gray-900">Customer Live Chat</a>
                <a href="#" className="block py-1.5 hover:text-gray-900">Feedbacks</a>
                <a href="#" className="block py-1.5 hover:text-gray-900">Ride Reports</a>
                <a href="#" className="block py-1.5 hover:text-gray-900">Website Contact Form</a>
              </div>
            </div>

            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 mt-2">
              <ShieldAlert size={18} className="text-gray-500" /> SOS
            </a>
            <Link to="/admin-settings" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50">
              <Settings size={18} className="text-gray-500" /> Settings
            </Link>
          </nav>
        </div>

        {/* Logout Action */}
        <div className="pt-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}