import { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle, XCircle, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { adminAPI } from '../services/api';
import ClassificationBadge from '../components/ClassificationBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import useStore from '../store/useStore';
import { Navigate, useNavigate } from 'react-router-dom';

export default function AdminModerationPage() {
  const { user } = useStore();
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const { addToast } = useStore();

  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = () => {
    setLoading(true);
    adminAPI.getQueue()
      .then(r => setQueue(r.data.data.queue))
      .catch(err => addToast('Failed to load queue', 'error'))
      .finally(() => setLoading(false));
  };

  const handleAction = async (reviewId, action) => {
    setActionLoading(reviewId);
    try {
      if (action === 'approve') {
        await adminAPI.approve(reviewId);
        addToast('Review approved', 'success');
      } else {
        await adminAPI.reject(reviewId);
        addToast('Review rejected', 'success');
      }
      loadQueue();
    } catch (err) {
      addToast(`Failed to ${action} review`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading moderation queue..." />;

  const pending = queue.filter(q => q.status !== 'resolved');
  const resolved = queue.filter(q => q.status === 'resolved');

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Moderation Queue</h1>
          <p className="text-sm opacity-60 font-bold">{pending.length} pending reviews</p>
        </div>
        <button onClick={loadQueue} className="neo-btn-blue !py-2 !px-4 text-sm">Refresh</button>
      </div>

      {pending.length === 0 ? (
        <div className="neo-card text-center py-12">
          <CheckCircle size={48} className="mx-auto mb-4 text-neo-green" />
          <h3 className="text-xl font-black">All Clear!</h3>
          <p className="text-sm opacity-60">No pending reviews to moderate</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map(item => (
            <div key={item.queue_id} className="neo-card !p-0 overflow-hidden">
              {/* Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-neo-yellow/10 transition-colors"
                onClick={() => setExpanded(expanded === item.queue_id ? null : item.queue_id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    item.priority >= 10 ? 'bg-neo-red' : item.priority >= 5 ? 'bg-neo-yellow' : 'bg-neo-green'
                  }`} />
                  <div>
                    <p className="font-bold">{item.username || 'Unknown'}</p>
                    <p className="text-xs opacity-50">
                      {item.product_name || 'Unknown Product'} · Priority: {item.priority}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {item.flag && <ClassificationBadge classification={item.flag.classification} size="sm" />}
                  <span className="font-black" style={{
                    color: (item.analysis?.trust_score || 0) >= 45 ? '#FFD93D' : '#FF6B6B'
                  }}>
                    {Math.round(item.analysis?.trust_score || 0)}
                  </span>
                  {expanded === item.queue_id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {/* Expanded Content */}
              {expanded === item.queue_id && (
                <div className="border-t-3 border-neo-text dark:border-white/20 p-4 space-y-4 animate-slide-up">
                  <div>
                    <p className="font-bold text-sm opacity-50 mb-1">Review Text</p>
                    <p className="text-sm bg-gray-50 dark:bg-neo-dark p-3 border-2 border-gray-200 dark:border-white/10 rounded">{item.review?.review_text}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><p className="font-bold opacity-50">Rating</p><p className="font-black">{item.review?.rating}/5</p></div>
                    <div><p className="font-bold opacity-50">Verified</p><p className="font-black">{item.review?.verified_purchase ? 'Yes' : 'No'}</p></div>
                    <div><p className="font-bold opacity-50">Reports</p><p className="font-black">{item.review?.report_count || 0}</p></div>
                    <div><p className="font-bold opacity-50">Device</p><p className="font-black">{item.review?.device_type || 'N/A'}</p></div>
                  </div>
                  {item.flag && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div><p className="font-bold opacity-50">Severity</p><p className="font-black">{item.flag.severity}</p></div>
                      <div><p className="font-bold opacity-50">Flag Reason</p><p className="font-black">{item.flag.flag_reason}</p></div>
                      <div><p className="font-bold opacity-50">Rule</p><p className="font-black">{item.flag.rule_triggered}</p></div>
                    </div>
                  )}
                  {item.analysis?.explanation && (
                    <div>
                      <p className="font-bold text-sm opacity-50 mb-1">AI Explanation</p>
                      <p className="text-sm">{item.analysis.explanation}</p>
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleAction(item.review_id, 'approve')}
                      disabled={actionLoading === item.review_id}
                      className="neo-btn-green !py-2 !px-5 text-sm flex items-center gap-2"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(item.review_id, 'reject')}
                      disabled={actionLoading === item.review_id}
                      className="neo-btn-red !py-2 !px-5 text-sm flex items-center gap-2"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                    <button
                      onClick={() => navigate(`/review/${item.review_id}`)}
                      className="neo-btn !py-2 !px-5 text-sm bg-white dark:bg-neo-dark-card flex items-center gap-2"
                    >
                      <Eye size={16} /> View Full
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resolved Section */}
      {resolved.length > 0 && (
        <div>
          <h3 className="font-black text-lg mb-3 opacity-50">Resolved ({resolved.length})</h3>
          <div className="space-y-2">
            {resolved.slice(0, 5).map(item => (
              <div key={item.queue_id} className="neo-card !p-3 opacity-60 flex items-center justify-between">
                <span className="font-bold text-sm">{item.username || 'Unknown'} — {item.product_name}</span>
                <span className="neo-badge text-xs bg-gray-200 dark:bg-gray-700">{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
