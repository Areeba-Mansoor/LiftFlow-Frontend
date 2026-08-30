import { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { Search, Bell, Calendar, ChevronDown } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [teamTimeFilter, setTeamTimeFilter] = useState('This Month');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // --- 1. METRICS DATA (Dynamic Calculation) ---
  const totalTickets = tickets.length;
  const unresolvedTickets = tickets.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  // --- 2. TICKET TRENDS LINE CHART (Dynamic grouped by day) ---
  const trendMap = tickets.reduce((acc, ticket) => {
    if (!ticket.createdAt) return acc;
    const date = new Date(ticket.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const trendData = daysOrder.map(day => ({
    day,
    tickets: trendMap[day] || 0
  }));

  // --- 3. TOP ISSUES BAR CHART (Dynamic categories count) ---
  const categoryCounts = tickets.reduce((acc, ticket) => {
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

  // --- 4. TICKETS BY SOURCE (Dynamic split based on total categories/sources) ---
  const sourceColors = ['#fbbf24', '#111827', '#22c55e', '#ef4444', '#3b82f6'];
  const sourceKeys = Object.keys(categoryCounts);
  const sourceData = sourceKeys.length > 0
    ? sourceKeys.map((cat, idx) => ({
        name: cat,
        value: categoryCounts[cat],
        color: sourceColors[idx % sourceColors.length]
      }))
    : [{ name: 'General', value: totalTickets || 1, color: '#fbbf24' }];

  // --- 5. SUPPORT TEAM PERFORMANCE TABLE (Dynamic agent tracking) ---
  const supportTeamPerformance = workers.map((worker, index) => {
    const assignedTickets = tickets.filter(t => {
      const wId = t.assignedWorker?._id || t.assignedWorker;
      return wId === worker._id;
    });
    
    const handledCount = assignedTickets.length;
    return {
      no: index + 1,
      id: worker._id,
      agent: worker.name || worker.email,
      handled: handledCount,
      time: '15 mins', 
      rating: '4.8 ★'
    };
  });

  return (
    <div className="min-h-screen bg-[#f9fafb] flex font-sans">
      <AdminSidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-w-0 bg-[#f9fafb]">
        
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-lg font-bold text-gray-900">Reports</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <Search size={18} />
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" 
                alt="Admin Profile" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-xs font-bold text-gray-900 hidden sm:inline">Admin User</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 space-y-6">
          
          {/* Section Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-900">Customer Support Overview</h2>
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs cursor-pointer">
              <Calendar size={14} className="text-gray-500" />
              <span>All Time</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#f3f0ff] border border-[#e9d5ff] p-5 rounded-2xl shadow-2xs">
              <p className="text-xs font-medium text-gray-500">Total Tickets</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-2">{totalTickets}</h3>
            </div>
            <div className="bg-[#f0fdf4] border border-[#dcfce7] p-5 rounded-2xl shadow-2xs">
              <p className="text-xs font-medium text-gray-500">Unresolved Tickets</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-2">{unresolvedTickets}</h3>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-2xs">
              <p className="text-xs font-medium text-gray-500">Resolved Tickets</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-2">{resolvedTickets}</h3>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-2xs">
              <p className="text-xs font-medium text-gray-500">Avg Response Time</p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-2">12 mins</h3>
            </div>
          </div>

          {/* Middle Row: Ticket Trends & Tickets by Source */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Line Chart */}
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-2xs lg:col-span-2 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xs font-bold text-gray-900">Ticket Trends Over Time</h3>
                  <div className="text-2xl font-extrabold text-gray-900 mt-1">{totalTickets}</div>
                </div>
                <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs text-gray-600 font-medium cursor-pointer">
                  <span>7 days</span>
                  <ChevronDown size={14} />
                </div>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="tickets" stroke="#d97706" strokeWidth={3} dot={{ fill: '#d97706', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tickets by Source (Semicircle Gauge) */}
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-gray-900">Tickets by Source</h3>
                <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs text-gray-600 font-medium cursor-pointer">
                  <span>7 days</span>
                  <ChevronDown size={14} />
                </div>
              </div>
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
                <div className="absolute inset-x-0 bottom-4 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[11px] text-gray-400 font-medium">Total Tickets</span>
                  <span className="text-sm font-extrabold text-gray-900">{totalTickets}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-2 pt-3 border-t border-gray-100 text-[11px] text-gray-600 font-medium">
                {sourceData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="truncate">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Row: Top Issues Bar Chart & Support Team Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
            
            {/* Top Issues Bar Chart */}
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-2xs">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-gray-900">Top Issues / Complaints</h3>
                <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs text-gray-600 font-medium cursor-pointer">
                  <span>7 days</span>
                  <ChevronDown size={14} />
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} interval={0} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#d97706" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Support Team Performance Table with Dynamic Agents & Assignment */}
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-gray-900">Support Team Performance</h3>
                <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs text-gray-600 font-medium cursor-pointer">
                  <span>{teamTimeFilter}</span>
                  <ChevronDown size={14} />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-medium text-[11px]">
                      <th className="pb-3 w-8">No</th>
                      <th className="pb-3">Agent</th>
                      <th className="pb-3 text-center">Tickets Handled</th>
                      <th className="pb-3 text-center">Avg Resolution Time</th>
                      <th className="pb-3 text-right">Avg ratings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {supportTeamPerformance.length > 0 ? (
                      supportTeamPerformance.map((row) => (
                        <tr key={row.no} className="hover:bg-gray-50/50">
                          <td className="py-3 text-gray-400 font-medium">{row.no}</td>
                          <td className="py-3 font-semibold text-gray-900 flex items-center gap-2">
                            {row.agent}
                          </td>
                          <td className="py-3 text-center font-medium">{row.handled}</td>
                          <td className="py-3 text-center text-gray-500">{row.time}</td>
                          <td className="py-3 text-right font-semibold text-gray-900">{row.rating}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-gray-400">No workers found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Quick Assignment Panel for Unassigned Complaints */}
              {tickets.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 font-medium">Assign Pending Complaints</span>
                  <select 
                    onChange={(e) => {
                      const [tId, wId] = e.target.value.split('|');
                      if (tId && wId) handleAssignWorker(tId, wId);
                    }}
                    defaultValue=""
                    className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-amber-800 outline-none cursor-pointer"
                  >
                    <option value="" disabled>Select unassigned ticket...</option>
                    {tickets.filter(t => !t.assignedWorker).map(ticket => (
                      workers.map(worker => (
                        <option key={`${ticket._id}-${worker._id}`} value={`${ticket._id}|${worker._id}`}>
                          {ticket.title?.substring(0, 20)}... → {worker.name}
                        </option>
                      ))
                    ))}
                  </select>
                </div>
              )}
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}