import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function TicketCard({ ticket, role, onUpdateStatus }) {
 
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-500/10 text-amber-400';
      case 'In Progress':
        return 'bg-blue-500/10 text-blue-400';
      case 'Resolved':
      case 'Closed':
        return 'bg-emerald-500/10 text-emerald-400';
      default:
        return 'bg-slate-500/10 text-slate-400';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3 transition hover:border-slate-700">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-full font-medium">
              {ticket.category}
            </span>
            <span className="text-xs text-slate-400">
              Priority: <strong className="text-slate-300">{ticket.priority}</strong>
            </span>
          </div>
          <h3 className="text-base font-semibold text-white mt-1">{ticket.title}</h3>
        </div>
        
        {/* Status Badge */}
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${getStatusBadge(ticket.status)}`}>
          {ticket.status === 'Pending' && <Clock size={14} />}
          {ticket.status === 'In Progress' && <AlertTriangle size={14} />}
          {(ticket.status === 'Resolved' || ticket.status === 'Closed') && <CheckCircle size={14} />}
          {ticket.status}
        </span>
      </div>

      <p className="text-slate-400 text-sm line-clamp-2">{ticket.description}</p>

      <div className="text-xs text-slate-500 flex flex-wrap justify-between items-end mt-2 pt-3 border-t border-slate-800/60">
        <div className="space-y-1">
          <span className="block">Customer: <strong className="text-slate-300">{ticket.customer?.name || 'Unknown'}</strong></span>
          <span className="block">Worker: <strong className="text-slate-300">{ticket.assignedWorker?.name || 'Unassigned'}</strong></span>
        </div>

        {/* Worker ke liye action buttons (Sirf tab dikhenge jab role='worker' pass hoga) */}
        {role === 'worker' && onUpdateStatus && (
          <div className="flex gap-2 mt-3 sm:mt-0">
            {ticket.status === 'Pending' && (
              <button
                onClick={() => onUpdateStatus(ticket._id, 'In Progress')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition"
              >
                Accept Task
              </button>
            )}
            {ticket.status === 'In Progress' && (
              <button
                onClick={() => onUpdateStatus(ticket._id, 'Resolved')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-medium transition"
              >
                Mark Resolved
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}