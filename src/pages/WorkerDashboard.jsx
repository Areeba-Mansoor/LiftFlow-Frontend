import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import WorkerSidebar from '../components/WorkerSidebar';
import { Ticket, Clock, CheckCircle2, RotateCw, PieChart as PieIcon, BarChart3, Menu } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export default function WorkerDashboard() {
  const [tasks, setTasks] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewType, setViewType] = useState('pie'); // 'pie' or 'bar'
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      setRefreshing(true);
      const res = await API.get('/tickets/assigned');
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching assigned tasks', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await API.patch(`/tickets/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  };

  // Metrics
  const totalAssigned = tasks.length;
  const pendingActive = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
  const resolvedTasks = tasks.filter(t => t.status === 'Resolved').length;

  // Chart Data Preparation
  const statusCounts = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = [
    { name: 'Pending', count: statusCounts['Pending'] || 0, color: '#d97706' },
    { name: 'In Progress', count: statusCounts['In Progress'] || 0, color: '#2563eb' },
    { name: 'Resolved', count: statusCounts['Resolved'] || 0, color: '#059669' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex">
      
      {/* Sidebar with Mobile Drawer State */}
      <WorkerSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 lg:p-8 space-y-6">

        {/* Header Title with Hamburger Button for Mobile */}
        <div className="flex justify-between items-center bg-white border border-gray-200 px-4 md:px-6 py-4 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg md:hidden cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-gray-800">
                Worker Dashboard
              </h1>
              <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                Track your assigned field requests and update status.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchTasks}
              className={`p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-200 transition-colors cursor-pointer ${refreshing ? 'animate-spin' : ''}`}
              title="Refresh Tasks"
            >
              <RotateCw size={18} />
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Total Assigned</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalAssigned}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Ticket size={22} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Pending / Active</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{pendingActive}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Clock size={22} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Resolved Tasks</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{resolvedTasks}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        {/* Task Status Breakdown Chart Section */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-gray-800">Task Status Breakdown</h2>
            <button 
              onClick={() => setViewType(viewType === 'pie' ? 'bar' : 'pie')}
              className="text-[11px] text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {viewType === 'pie' ? <BarChart3 size={14} /> : <PieIcon size={14} />}
              {viewType === 'pie' ? 'Bar View' : 'Pie View'}
            </button>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {tasks.length === 0 ? (
              <p className="text-xs text-gray-400">No data available for chart</p>
            ) : viewType === 'pie' ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={5}
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} />
                  <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Assigned Tasks List Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-800">Assigned Field Tickets</h2>
          {tasks.length === 0 ? (
            <div className="bg-white border border-gray-200 p-8 rounded-2xl text-center text-gray-400 text-xs shadow-xs">
              No tasks have been assigned to you yet.
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((t) => (
                <div key={t._id} className="bg-white border border-gray-200 p-5 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-gray-300">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                        {t.category}
                      </span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                        t.priority === 'High' ? 'bg-red-50 text-red-700' :
                        t.priority === 'Medium' ? 'bg-amber-50 text-amber-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {t.priority} Priority
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-800">{t.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{t.description}</p>
                    <p className="text-[11px] text-gray-400 pt-1">
                      Customer: <strong className="text-gray-700">{t.customer?.name || 'N/A'}</strong> ({t.customer?.email || 'No email'})
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusUpdate(t._id, e.target.value)}
                      className={`text-xs font-medium px-3 py-2 rounded-xl outline-none cursor-pointer border transition-colors ${
                        t.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        t.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
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