import { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { Search, Bell, Calendar, ChevronDown, CheckCircle2, Clock, Menu } from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Mobile Sidebar Toggle State (Hamburger ke liye)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [adminName, setAdminName] = useState('Admin User');
  const [adminAvatar, setAdminAvatar] = useState('');

  const [timeFilter, setTimeFilter] = useState('All Time');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  const [trendFilter, setTrendFilter] = useState('7 days');
  const [isTrendDropdownOpen, setIsTrendDropdownOpen] = useState(false);

  const [teamTimeFilter] = useState('This Month');
  const timeDropdownRef = useRef(null);
  const trendDropdownRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketRes, workerRes] = await Promise.all([
        API.get('/tickets'),
        API.get('/tickets/workers')
      ]);
      setTickets(Array.isArray(ticketRes.data) ? ticketRes.data : []);
      setWorkers(Array.isArray(workerRes.data) ? workerRes.data : []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const storedUser = localStorage.getItem('user') || localStorage.getItem('admin');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.name) setAdminName(parsed.name);
        if (parsed?.avatar) setAdminAvatar(parsed.avatar);
      } catch (e) {
        setAdminName(storedUser);
      }
    }
  }, []);

  const getInitials = (name) => {
    if (!name) return 'AU';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleAssignWorker = async (ticketId, workerId) => {
    try {
      await API.put(`/tickets/${ticketId}`, { 
        assignedWorker: workerId, 
        status: 'In Progress' 
      });
      fetchData();
    } catch (err) {
      console.error('Error assigning worker:', err);
      alert('Failed to assign worker.');
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (!ticket.createdAt) return true;
    const ticketDate = new Date(ticket.createdAt);
    const now = new Date();

    if (timeFilter === 'Today') {
      return ticketDate.toDateString() === now.toDateString();
    } else if (timeFilter === 'This Week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      return ticketDate >= weekAgo;
    } else if (timeFilter === 'This Month') {
      return ticketDate.getMonth() === now.getMonth() && ticketDate.getFullYear() === now.getFullYear();
    }
    return true; 
  });

  const totalTickets = filteredTickets.length;
  const unresolvedTickets = filteredTickets.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
  const resolvedTickets = filteredTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  const trendFilteredTickets = tickets.filter(ticket => {
    if (!ticket.createdAt) return true;
    const ticketDate = new Date(ticket.createdAt);
    const now = new Date();
    if (trendFilter === '7 days') {
      const daysAgo = new Date();
      daysAgo.setDate(now.getDate() - 7);
      return ticketDate >= daysAgo;
    } else if (trendFilter === '30 days') {
      const daysAgo = new Date();
      daysAgo.setDate(now.getDate() - 30);
      return ticketDate >= daysAgo;
    }
    return true;
  });

  const trendMap = trendFilteredTickets.reduce((acc, ticket) => {
    if (!ticket.createdAt) return acc;
    const date = new Date(ticket.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
    if (!acc[date]) {
      acc[date] = { total: 0, resolved: 0 };
    }
    acc[date].total += 1;
    if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
      acc[date].resolved += 1;
    }
    return acc;
  }, {});

  const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const trendData = daysOrder.map(day => ({
    day,
    incoming: trendMap[day]?.total || 0,
    resolved: trendMap[day]?.resolved || 0
  }));

  const categoryCounts = filteredTickets.reduce((acc, ticket) => {
    const cat = ticket.category || 'Others';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const barChartData = Object.keys(categoryCounts).length > 0 
    ? Object.keys(categoryCounts).map(cat => ({
        name: cat,
        count: categoryCounts[cat]
      }))
    : [{ name: 'No Issues', count: 0 }];

  const sourceColors = ['#f59e0b', '#111827', '#fbbf24', '#f97316', '#d97706'];
  const sourceKeys = Object.keys(categoryCounts);
  const sourceData = sourceKeys.length > 0
    ? sourceKeys.map((cat, idx) => ({
        name: cat,
        value: categoryCounts[cat],
        color: sourceColors[idx % sourceColors.length]
      }))
    : [{ name: 'General', value: totalTickets || 1, color: '#f59e0b' }];

  const supportTeamPerformance = workers.map((worker, index) => {
    const assignedTickets = filteredTickets.filter(t => {
      const wId = t.assignedWorker?._id || t.assignedWorker;
      return wId === worker._id;
    });
    
    return {
      no: index + 1,
      id: worker._id,
      agent: worker.name || worker.email,
      handled: assignedTickets.length,
      time: '15 mins', 
      rating: '4.8 ★'
    };
  });

  return (
    <div className="min-h-screen bg-[#fffdfa] flex font-sans">
      
      {/* Sidebar Component with isOpen & onClose props */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="flex-1 md:ml-64 flex flex-col min-w-0 bg-[#fffdfa]">
        
        {/* Top Navbar */}
        <header className="bg-white border-b border-amber-100 h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Button for Mobile */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-700 hover:bg-amber-50 rounded-lg md:hidden transition-colors cursor-pointer"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-base md:text-lg font-bold text-gray-900 truncate">Reports Dashboard</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 text-gray-500 hover:bg-amber-50 rounded-full transition-colors hidden sm:flex">
              <Search size={18} />
            </button>
            <button className="p-2 text-gray-500 hover:bg-amber-50 rounded-full relative transition-colors">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-3 pl-2 md:pl-3 border-l border-amber-100">
              {adminAvatar ? (
                <img 
                  src={adminAvatar} 
                  alt={adminName} 
                  className="w-8 h-8 rounded-full object-cover shadow-2xs border border-amber-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {getInitials(adminName)}
                </div>
              )}
              <span className="text-xs font-bold text-gray-900 hidden sm:inline">{adminName}</span>
            </div>
          </div>
        </header>

        {/* Dashboard Main Content */}
        <main className="p-4 md:p-6 space-y-6">
          <div className="flex justify-between items-center relative">
            <h2 className="text-sm font-bold text-gray-900">Customer Support Overview</h2>
            
            <div className="relative" ref={timeDropdownRef}>
              <div 
                onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                className="flex items-center gap-2 bg-white border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs cursor-pointer select-none hover:bg-amber-50/50 transition-colors"
              >
                <Calendar size={14} className="text-amber-500" />
                <span>{timeFilter}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>

              {isTimeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-amber-200 rounded-xl shadow-lg py-1 z-20 text-xs font-medium text-gray-700">
                  {['All Time', 'Today', 'This Week', 'This Month'].map((option) => (
                    <div 
                      key={option}
                      onClick={() => {
                        setTimeFilter(option);
                        setIsTimeDropdownOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-amber-50 hover:text-amber-700 cursor-pointer"
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#fffbeb] border border-[#fde68a] p-5 rounded-2xl shadow-2xs">
              <p className="text-xs font-semibold text-amber-800">Total Tickets</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-2">{totalTickets}</h3>
            </div>
            <div className="bg-[#fff7ed] border border-[#ffedd5] p-5 rounded-2xl shadow-2xs">
              <p className="text-xs font-semibold text-orange-800">Unresolved Tickets</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-2">{unresolvedTickets}</h3>
            </div>
            <div className="bg-white border border-amber-200 p-5 rounded-2xl shadow-2xs">
              <p className="text-xs font-semibold text-gray-600">Resolved Tickets</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-2">{resolvedTickets}</h3>
            </div>
            <div className="bg-white border border-amber-200 p-5 rounded-2xl shadow-2xs">
              <p className="text-xs font-semibold text-gray-600">Avg Response Time</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-2">12 mins</h3>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-amber-200/80 p-5 rounded-2xl shadow-xs lg:col-span-2 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4 relative">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 tracking-tight">Sales & Ticket Analytics</h3>
                  <div className="text-2xl font-extrabold text-gray-900 mt-0.5">{trendFilteredTickets.length}</div>
                </div>

                <div className="relative" ref={trendDropdownRef}>
                  <div 
                    onClick={() => setIsTrendDropdownOpen(!isTrendDropdownOpen)}
                    className="flex items-center gap-1.5 bg-amber-50/50 hover:bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-xs text-gray-700 font-semibold cursor-pointer select-none transition-colors"
                  >
                    <span>{trendFilter}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </div>

                  {isTrendDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-amber-200 rounded-xl shadow-xl py-1 z-20 text-xs font-medium text-gray-700">
                      {['7 days', '30 days', 'All Time'].map((opt) => (
                        <div 
                          key={opt}
                          onClick={() => {
                            setTrendFilter(opt);
                            setIsTrendDropdownOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-amber-50 hover:text-amber-700 cursor-pointer"
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="h-64 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fef3c7" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#fde68a' }} dy={8} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="incoming" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="#fef3c7" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Source breakdown */}
            <div className="bg-white border border-amber-200 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
              <h3 className="text-xs font-bold text-gray-900 mb-2">Tickets by Source</h3>
              <div className="h-44 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sourceData} cx="50%" cy="80%" startAngle={180} endAngle={0} innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-amber-200 p-5 rounded-2xl shadow-2xs pb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4">All Customer Complaints</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-amber-100 text-gray-400 font-medium text-[11px]">
                    <th className="pb-3 pl-2">#</th>
                    <th className="pb-3">Title</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Assign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50 text-gray-700">
                  {tickets.map((ticket, index) => (
                    <tr key={ticket._id || index} className="hover:bg-amber-50/30">
                      <td className="py-3.5 pl-2">{index + 1}</td>
                      <td className="py-3.5 font-semibold">{ticket.title}</td>
                      <td className="py-3.5">{ticket.category}</td>
                      <td className="py-3.5">{ticket.status}</td>
                      <td className="py-3.5 text-right pr-2">
                        <select 
                          onChange={(e) => handleAssignWorker(ticket._id, e.target.value)}
                          defaultValue=""
                          className="bg-amber-50 border border-amber-200 rounded-lg px-2 py-1"
                        >
                          <option value="" disabled>Select worker</option>
                          {workers.map(w => (
                            <option key={w._id} value={w._id}>{w.name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}