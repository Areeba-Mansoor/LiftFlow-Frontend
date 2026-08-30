import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import CustomerSidebar from '../components/CustomerSidebar';
import { PlusCircle, Clock, CheckCircle2, Ticket, LogOut } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function CustomerDashboard() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', category: 'Water Tanker', priority: 'Medium' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      const res = await API.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error('Error fetching tickets', err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/tickets', form);
      setForm({ title: '', description: '', category: 'Water Tanker', priority: 'Medium' });
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  // Computed metrics for cards
  const totalTickets = tickets.length;
  const pendingTickets = tickets.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved').length;

  // Prepare data for Category Bar Chart
  const categoryCounts = tickets.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});

  const chartData = [
    { name: 'Water Tanker', count: categoryCounts['Water Tanker'] || 0 },
    { name: 'Driver Misconduct', count: categoryCounts['Driver Misconduct'] || 0 },
    { name: 'App Crashes', count: categoryCounts['App Crashes'] || 0 },
    { name: 'Payment Disputes', count: categoryCounts['Payment Disputes'] || 0 },
    { name: 'Other', count: categoryCounts['Other'] || 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex">
      
      {/* Alag Sidebar Component */}
      <CustomerSidebar />

      {/* Main Content Area (ml-64 to adjust for fixed sidebar) */}
      <main className="flex-1 md:ml-64 p-6 lg:p-8 space-y-6">
        
        {/* Header Title */}
        <div className="flex justify-between items-center bg-white border border-gray-200 px-6 py-4 rounded-2xl shadow-xs">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-800">Customer Support Overview</h1>
            <p className="text-xs text-gray-500 mt-0.5">Welcome back, {user?.name || 'Customer'}! Manage your support tickets and track resolution progress.</p>
          </div>
        </div>

        {/* Top Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Total Tickets</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalTickets}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Ticket size={22} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Unresolved Tickets</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{pendingTickets}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Clock size={22} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Resolved Tickets</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{resolvedTickets}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        {/* Analytics Bar Chart Section */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-gray-800">Tickets by Category</h2>
            <span className="text-[11px] text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">Overview</span>
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Create Ticket Form */}
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xs h-fit">
            <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <PlusCircle className="text-amber-600" size={18} />
              Create New Ticket
            </h2>
            {error && <p className="text-red-600 text-xs mb-3 font-medium">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-gray-600 mb-1">Ticket Title</label>
                <input 
                  type="text" 
                  required 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Water tank tanker delivery delayed"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-amber-500 transition-all text-gray-900"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-600 mb-1">Category / Issue Type</label>
                <select 
                  value={form.category} 
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-amber-500 transition-all text-gray-900 cursor-pointer"
                >
                  <option value="Water Tanker">Water Tanker</option>
                  <option value="Driver Misconduct">Driver Misconduct</option>
                  <option value="App Crashes">App Crashes</option>
                  <option value="Payment Disputes">Payment Disputes</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-600 mb-1">Priority Level</label>
                <select 
                  value={form.priority} 
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-amber-500 transition-all text-gray-900 cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-600 mb-1">Description</label>
                <textarea 
                  rows="3" 
                  required 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your water delivery or support issue in detail..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-amber-500 transition-all text-gray-900 resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {loading ? 'Submitting Ticket...' : 'Submit Ticket'}
              </button>
            </form>
          </div>

          {/* Tickets History List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-gray-800 mb-2">My Support Tickets History</h2>
            {tickets.length === 0 ? (
              <div className="bg-white border border-gray-200 p-8 rounded-2xl text-center text-gray-400 text-xs shadow-xs">
                No support tickets created yet. Use the form to raise a new ticket.
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((t) => (
                  <div key={t._id} className="bg-white border border-gray-200 p-5 rounded-2xl shadow-xs flex flex-col gap-3 transition-all hover:border-gray-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">
                          {t.category}
                        </span>
                        <h3 className="text-sm font-bold text-gray-800 mt-2">{t.title}</h3>
                      </div>
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                        t.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        t.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{t.description}</p>
                    <div className="text-xs text-gray-400 pt-2 border-t border-gray-100 flex justify-between items-center">
                      <span>Priority: <strong className="text-gray-700">{t.priority}</strong></span>
                      <span>Assigned Worker: <strong className="text-gray-700">{t.assignedWorker?.name || 'Unassigned'}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}