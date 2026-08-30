import { useState, useEffect } from 'react';
import API from '../services/api';
import WorkerSidebar from '../components/WorkerSidebar';
import { Clock, CheckCircle2, Ticket, RefreshCw, Search, Bell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function WorkerDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAssignedTickets = async () => {
    try {
      setLoading(true);
      const res = await API.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error('Error fetching tickets', err);
      setError('Failed to fetch assigned tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedTickets();
  }, []);

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      await API.patch(`/tickets/${ticketId}/status`, { status: newStatus });
      fetchAssignedTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update ticket status');
    }
  };

  // Metrics
  const totalTickets = tickets.length;
  const inProgressTickets = tickets.filter(t => t.status === 'In Progress' || t.status === 'Pending').length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved').length;

  const chartData = [
    { name: 'Pending', count: tickets.filter(t => t.status === 'Pending').length },
    { name: 'In Progress', count: tickets.filter(t => t.status === 'In Progress').length },
    { name: 'Resolved', count: resolvedTickets },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex">
      
      {/* Sidebar */}
      <WorkerSidebar />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-6 lg:p-8 space-y-6">
        
        {/* Top Navbar Header */}
        <div className="flex justify-between items-center bg-white border border-gray-200 px-6 py-4 rounded-2xl shadow-xs">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900">Worker Dashboard</h1>
            <p className="text-xs text-gray-500 mt-0.5">Track your assigned field requests and update status.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchAssignedTickets}
              className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors cursor-pointer border border-gray-200"
              title="Refresh Data"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <div className="p-2 bg-gray-50 text-gray-600 rounded-xl border border-gray-200">
              <Bell size={16} />
            </div>
          </div>
        </div>

        {/* Top Overview Cards (Exact Theme Match) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Total Assigned</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalTickets}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Ticket size={22} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Pending / Active</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{inProgressTickets}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Clock size={22} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Resolved Tasks</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{resolvedTickets}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        {/* Analytics Bar Chart Section (Admin Theme Yellow/Amber Bar Style) */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-gray-900">Task Status Performance</h2>
            <span className="text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">Overview</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                />
                <Bar dataKey="count" fill="#d97706" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Assigned Support Tickets</h2>
          {error && <p className="text-red-600 text-xs font-medium">{error}</p>}
          
          {tickets.length === 0 ? (
            <div className="bg-white border border-gray-200 p-8 rounded-2xl text-center text-gray-400 text-xs shadow-xs">
              No tickets assigned to you currently.
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <div key={t._id} className="bg-white border border-gray-200 p-5 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-gray-300">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider border border-amber-100">
                        {t.category}
                      </span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                        t.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-200' :
                        t.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        Priority: {t.priority}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">{t.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{t.description}</p>
                  </div>

                  {/* Actions / Status Dropdown */}
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <div className="text-xs text-right">
                      <span className="text-gray-400 block text-[10px]">Current Status</span>
                      <span className={`font-semibold ${
                        t.status === 'Pending' ? 'text-amber-600' :
                        t.status === 'In Progress' ? 'text-blue-600' : 'text-emerald-600'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <select
                      value={t.status}
                      onChange={(e) => handleStatusUpdate(t._id, e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}