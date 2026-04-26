import { useEffect, useState } from 'react';
import { MessageSquare, ShieldAlert, TrendingUp, Users, Clock, CheckCircle } from 'lucide-react';
import { analyticsAPI } from '../services/api';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function DashboardPage() {
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

      {/* Suspicious Reviews Feed */}
      <div className="neo-card">
        <h3 className="font-black text-lg mb-4 flex items-center gap-2">
          <ShieldAlert className="text-neo-red" size={20} />
          Recent Suspicious Reviews
        </h3>
        {suspiciousReviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-3 border-neo-text dark:border-white/20">
                  <th className="text-left py-3 px-2 font-black">Reviewer</th>
                  <th className="text-left py-3 px-2 font-black">Product</th>
                  <th className="text-left py-3 px-2 font-black hidden md:table-cell">Review</th>
                  <th className="text-center py-3 px-2 font-black">Trust</th>
                  <th className="text-center py-3 px-2 font-black">Type</th>
                </tr>
              </thead>
              <tbody>
                {suspiciousReviews.slice(0, 8).map((r, i) => (
                  <tr key={i} className="border-b-2 border-gray-100 dark:border-white/10 hover:bg-neo-yellow/10 transition-colors">
                    <td className="py-3 px-2 font-bold">{r.username}</td>
                    <td className="py-3 px-2">{r.product_name?.substring(0, 20)}</td>
                    <td className="py-3 px-2 hidden md:table-cell opacity-60">{r.review_text?.substring(0, 50)}...</td>
                    <td className="py-3 px-2 text-center">
                      <span className="font-black" style={{
                        color: (r.trust_score || 0) >= 45 ? '#FFD93D' : '#FF6B6B'
                      }}>{Math.round(r.trust_score || 0)}</span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`neo-badge text-xs ${
                        r.classification === 'deceptive' ? 'bg-neo-red text-white' : 'bg-neo-yellow'
                      }`}>
                        {r.classification}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 opacity-50">
            <CheckCircle size={32} className="mx-auto mb-2 text-neo-green" />
            <p className="font-bold">No suspicious reviews detected</p>
          </div>
        )}
      </div>
    </div>
  );
}
