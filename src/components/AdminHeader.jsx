import { useState, useEffect, useRef } from 'react';
import { Search, Bell, X } from 'lucide-react';
import API from '../services/api';

export default function AdminHeader({ onSearch }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminUser, setAdminUser] = useState({ name: 'Admin', profileImage: '' });
  const dropdownRef = useRef(null);

  useEffect(() => {
    // 1. LocalStorage se logged-in user ki details uthana (jisme profileImage bhi hogi)
    const storedUser = JSON.parse(localStorage.getItem('userInfo'));
    if (storedUser) {
      setAdminUser(storedUser);
    }

    // 2. Fresh profile data API se fetch karna taaki update hone par foran dikhe
    const fetchProfile = async () => {
      try {
        const res = await API.get('/auth/me');
        if (res.data) {
          setAdminUser(res.data);
          localStorage.setItem('userInfo', JSON.stringify(res.data)); // Update cache
        }
      } catch (err) {
        console.error('Failed to fetch admin profile', err);
      }
    };
    fetchProfile();

    // 3. Notifications fetch karna
    const fetchNotifications = async () => {
      try {
        const res = await API.get('/tickets/notifications');
        setNotifications(res.data || []);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchNotifications();

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/tickets/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) onSearch(query);
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between sticky top-0 z-20">
      <h1 className="text-xl font-bold tracking-tight text-gray-800 hidden sm:block">Dashboard</h1>
      
      <div className="flex items-center gap-4 ml-auto">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search tickets, users..." 
            className="bg-gray-100 pl-9 pr-4 py-2 rounded-full text-xs outline-none w-56 sm:w-72 focus:ring-1 focus:ring-amber-500 transition-all"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); if(onSearch) onSearch(''); }} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative cursor-pointer"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-gray-100 font-bold text-gray-800 flex justify-between items-center">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{unreadCount} New</span>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">No new notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif._id} 
                      onClick={() => handleMarkAsRead(notif._id)}
                      className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${!notif.read ? 'bg-amber-50/40 font-semibold' : ''}`}
                    >
                      <p className="text-gray-800">{notif.title}</p>
                      <p className="text-gray-500 text-[11px] mt-0.5">{notif.message}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      
        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
          <img 
            src={adminUser?.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"} 
            alt="Admin Profile" 
            className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-xs"
          />
          <span className="text-xs font-bold text-gray-800 hidden sm:inline">{adminUser?.name || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
}