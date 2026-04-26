import { useEffect, useState } from 'react';
import { BadgeCheck, MessageSquare, Flag, Star, Shield } from 'lucide-react';
import { authAPI } from '../services/api';
import TrustScoreMeter from '../components/TrustScoreMeter';
import LoadingSpinner from '../components/LoadingSpinner';
import useStore from '../store/useStore';

export default function ProfilePage() {
  const { user: storeUser, updateUser } = useStore();
  const [user, setUser] = useState(storeUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI.me()
      .then(res => {
        setUser(res.data.data.user);
        updateUser(res.data.data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading profile..." />;
  if (!user) return <div className="neo-card text-center py-12 font-bold">Profile not found</div>;

  const stats = [
    { icon: MessageSquare, label: 'Reviews Written', value: user.review_count || 0, color: 'bg-neo-blue' },
    { icon: Flag, label: 'Reports Received', value: user.report_count || 0, color: 'bg-neo-red' },
    { icon: Star, label: 'Account Status', value: user.account_status || 'active', color: 'bg-neo-green' },
    { icon: Shield, label: 'Role', value: user.role || 'user', color: 'bg-neo-purple' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      <h1 className="text-3xl font-black">My Profile</h1>

      {/* Profile Header */}
      <div className="neo-card">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-neo-purple border-4 border-neo-text dark:border-white/30 flex items-center justify-center shadow-neo text-white text-4xl font-black">
            {user.username[0].toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-2xl font-black">{user.username}</h2>
              {user.verified_status && (
                <BadgeCheck size={22} className="text-neo-blue" />
              )}
            </div>
            <p className="text-sm opacity-60 font-bold">{user.email}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
              <span className={`neo-badge text-xs ${
                user.account_status === 'active' ? 'bg-neo-green text-white' :
                user.account_status === 'watchlist' ? 'bg-neo-yellow' : 'bg-neo-red text-white'
              }`}>{user.account_status}</span>
              {user.role === 'admin' && <span className="neo-badge text-xs bg-neo-purple text-white">Admin</span>}
            </div>
            <p className="text-xs opacity-40 mt-2">
              Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="relative">
            <TrustScoreMeter score={user.credibility_score || 50} size={120} label="Credibility" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="neo-card text-center">
            <div className={`w-12 h-12 ${s.color} border-3 border-neo-text dark:border-white/30 rounded-lg mx-auto mb-2 flex items-center justify-center shadow-neo-sm`}>
              <s.icon size={20} className="text-white" />
            </div>
            <p className="text-xl font-black capitalize">{s.value}</p>
            <p className="text-xs font-bold opacity-50">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Credibility Breakdown */}
      <div className="neo-card">
        <h3 className="font-black text-lg mb-4">Credibility Score Breakdown</h3>
        <div className="space-y-3">
          {[
            { label: 'Verified Status', value: user.verified_status ? 'Yes' : 'No', pct: user.verified_status ? 100 : 0, color: 'bg-neo-green' },
            { label: 'Review Activity', value: `${user.review_count} reviews`, pct: Math.min(100, (user.review_count || 0) * 10), color: 'bg-neo-blue' },
            { label: 'Report History', value: `${user.report_count} reports`, pct: Math.max(0, 100 - (user.report_count || 0) * 20), color: 'bg-neo-yellow' },
            { label: 'Overall Score', value: `${user.credibility_score}/100`, pct: user.credibility_score || 50, color: 'bg-neo-purple' },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 border-2 border-neo-text dark:border-white/20 rounded-sm overflow-hidden">
                <div className={`h-full ${item.color} transition-all duration-700`} style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
