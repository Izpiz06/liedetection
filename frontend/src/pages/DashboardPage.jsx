import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ShieldAlert, TrendingUp, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { analyticsAPI } from '../services/api';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// Map classification / flag reasons to badge styles
const getFlagBadge = (classification) => {
  const c = (classification || '').toLowerCase();
  if (c === 'deceptive' || c === 'bot' || c === 'bot language')
    return { bg: 'bg-red-100 dark:bg-red-900/40', border: 'border-neo-text dark:border-red-400', text: 'text-red-800 dark:text-red-300', label: classification || 'Deceptive' };
  if (c === 'suspicious' || c === 'competitor' || c === 'competitor mention')
    return { bg: 'bg-cyan-100 dark:bg-cyan-900/40', border: 'border-neo-text dark:border-cyan-400', text: 'text-cyan-800 dark:text-cyan-300', label: classification || 'Suspicious' };
  if (c === 'gibberish' || c === 'spam')
    return { bg: 'bg-red-100 dark:bg-red-900/40', border: 'border-neo-text dark:border-red-400', text: 'text-red-800 dark:text-red-300', label: classification || 'Gibberish' };
  return { bg: 'bg-neo-yellow/30 dark:bg-yellow-900/40', border: 'border-neo-text dark:border-yellow-400', text: 'text-yellow-800 dark:text-yellow-300', label: classification || 'Unknown' };
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [classDist, setClassDist] = useState([]);
  const [productTrust, setProductTrust] = useState([]);
  const [suspiciousReviews, setSuspiciousReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.overview(),
      analyticsAPI.classificationDist(),
      analyticsAPI.products(),
      analyticsAPI.suspicious(),
    ]).then(([statsRes, classRes, prodRes, suspRes]) => {
      setStats(statsRes.data.data);
      setClassDist(classRes.data.data);
      setProductTrust(prodRes.data.data);
      setSuspiciousReviews(suspRes.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const pieData = {
    labels: classDist.map(d => d.classification?.charAt(0).toUpperCase() + d.classification?.slice(1)),
    datasets: [{
      data: classDist.map(d => d.count),
      backgroundColor: ['#6BCB77', '#FFD93D', '#FF6B6B'],
      borderColor: '#111111',
      borderWidth: 3,
    }],
  };

  const barData = {
    labels: productTrust.slice(0, 8).map(p => p.product_name?.substring(0, 15)),
    datasets: [{
      label: 'Trust Score',
      data: productTrust.slice(0, 8).map(p => p.overall_trust_score),
      backgroundColor: productTrust.slice(0, 8).map(p =>
        p.overall_trust_score >= 75 ? '#6BCB77' : p.overall_trust_score >= 45 ? '#FFD93D' : '#FF6B6B'
      ),
      borderColor: '#111111',
      borderWidth: 2,
    }],
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-3xl font-black">Dashboard</h1>
        <p className="text-sm opacity-60 font-bold">ReviewShield AI Overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={MessageSquare} label="Total Reviews" value={stats?.total_reviews || 0} color="bg-neo-blue" />
        <StatsCard icon={ShieldAlert} label="Suspicious Found" value={stats?.suspicious_count || 0} color="bg-neo-red" />
        <StatsCard icon={TrendingUp} label="Avg Trust Score" value={`${Math.round(stats?.avg_trust_score || 0)}%`} color="bg-neo-green" />
        <StatsCard icon={Clock} label="Pending Moderation" value={stats?.pending_moderation || 0} color="bg-neo-yellow" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classification Pie */}
        <div className="neo-card">
          <h3 className="font-black text-lg mb-4">Review Classification</h3>
          <div className="max-w-[280px] mx-auto">
            {classDist.length > 0 ? (
              <Pie data={pieData} options={{
                plugins: { legend: { position: 'bottom', labels: { font: { weight: 'bold', family: 'Inter' } } } },
              }} />
            ) : (
              <p className="text-center opacity-50 py-8">No data yet</p>
            )}
          </div>
        </div>

        {/* Product Trust Bar Chart */}
        <div className="neo-card">
          <h3 className="font-black text-lg mb-4">Product Trust Scores</h3>
          {productTrust.length > 0 ? (
            <Bar data={barData} options={{
              responsive: true,
              scales: {
                y: { beginAtZero: true, max: 100, ticks: { font: { weight: 'bold' } } },
                x: { ticks: { font: { weight: 'bold', size: 10 } } },
              },
              plugins: { legend: { display: false } },
            }} />
          ) : (
            <p className="text-center opacity-50 py-8">No data yet</p>
          )}
        </div>
      </div>

      {/* ── Suspicious Reviews Feed (neo-brutalist table) ── */}
      <section className="bg-white dark:bg-[#252547] border-4 border-neo-text dark:border-white/30 shadow-neo dark:shadow-neo-dark rounded-lg overflow-hidden">
        {/* Table Header Bar */}
        <div className="px-6 py-4 border-b-4 border-neo-text dark:border-white/30 flex justify-between items-center bg-gray-100 dark:bg-white/5">
          <h3 className="text-xl font-black flex items-center gap-2">
            <ShieldAlert className="text-neo-red" size={22} />
            Suspicious Reviews Feed
          </h3>
          <button
            onClick={() => navigate('/analytics')}
            className="bg-neo-yellow text-neo-text border-4 border-neo-text shadow-[4px_4px_0px_0px_#111] rounded-lg px-4 py-2 font-bold text-xs uppercase tracking-widest hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[6px_6px_0px_0px_#111] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all flex items-center gap-2"
          >
            View All
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Table */}
        {suspiciousReviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b-4 border-neo-text dark:border-white/30 bg-gray-200/60 dark:bg-white/5">
                  <th className="p-4 font-black text-xs uppercase tracking-widest border-r-4 border-neo-text dark:border-white/20">Product</th>
                  <th className="p-4 font-black text-xs uppercase tracking-widest border-r-4 border-neo-text dark:border-white/20">User</th>
                  <th className="p-4 font-black text-xs uppercase tracking-widest border-r-4 border-neo-text dark:border-white/20">Snippet</th>
                  <th className="p-4 font-black text-xs uppercase tracking-widest border-r-4 border-neo-text dark:border-white/20">Flag Reason</th>
                  <th className="p-4 font-black text-xs uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-neo-text dark:divide-white/20">
                {suspiciousReviews.slice(0, 8).map((r, i) => {
                  const badge = getFlagBadge(r.classification);
                  return (
                    <tr key={i} className="hover:bg-neo-yellow/10 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold border-r-4 border-neo-text dark:border-white/20">
                        {r.product_name?.substring(0, 25) || 'Unknown Product'}
                      </td>
                      <td className="p-4 border-r-4 border-neo-text dark:border-white/20">
                        {r.username || 'Anonymous'}
                      </td>
                      <td className="p-4 border-r-4 border-neo-text dark:border-white/20 max-w-xs truncate opacity-75">
                        "{r.review_text?.substring(0, 60) || '...'}..."
                      </td>
                      <td className="p-4 border-r-4 border-neo-text dark:border-white/20">
                        <span className={`inline-block px-3 py-1 ${badge.bg} border-2 ${badge.border} font-bold text-xs uppercase ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => r.review_id && navigate(`/review/${r.review_id}`)}
                          className="bg-neo-text dark:bg-white text-white dark:text-neo-text px-4 py-1.5 border-2 border-neo-text dark:border-white font-bold text-xs uppercase tracking-wide hover:bg-neo-yellow hover:text-neo-text dark:hover:bg-neo-yellow dark:hover:text-neo-text transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 opacity-50">
            <CheckCircle size={36} className="mx-auto mb-3 text-neo-green" />
            <p className="font-bold text-lg">No suspicious reviews detected</p>
            <p className="text-sm opacity-60 mt-1">All reviews look authentic — great news!</p>
          </div>
        )}
      </section>
    </div>
  );
}
