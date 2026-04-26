import { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, Filler
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

export default function AnalyticsPage() {
  const [classDist, setClassDist] = useState([]);
  const [productTrust, setProductTrust] = useState([]);
  const [topReviewers, setTopReviewers] = useState([]);
  const [sentimentTrend, setSentimentTrend] = useState([]);
  const [trustDist, setTrustDist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.classificationDist(),
      analyticsAPI.products(),
      analyticsAPI.reviewers(),
      analyticsAPI.sentimentTrend(),
      analyticsAPI.trustDist(),
    ]).then(([classRes, prodRes, revRes, sentRes, trustRes]) => {
      setClassDist(classRes.data.data);
      setProductTrust(prodRes.data.data);
      setTopReviewers(revRes.data.data);
      setSentimentTrend(sentRes.data.data);
      setTrustDist(trustRes.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading analytics..." />;

  const pieData = {
    labels: classDist.map(d => d.classification?.charAt(0).toUpperCase() + d.classification?.slice(1)),
    datasets: [{
      data: classDist.map(d => d.count),
      backgroundColor: ['#6BCB77', '#FFD93D', '#FF6B6B'],
      borderColor: '#111111',
      borderWidth: 3,
    }],
  };

  const productBarData = {
    labels: productTrust.map(p => p.product_name?.substring(0, 18)),
    datasets: [{
      label: 'Trust Score',
      data: productTrust.map(p => p.overall_trust_score),
      backgroundColor: productTrust.map(p =>
        p.overall_trust_score >= 75 ? '#6BCB77' : p.overall_trust_score >= 45 ? '#FFD93D' : '#FF6B6B'
      ),
      borderColor: '#111111',
      borderWidth: 2,
    }],
  };

  const sentimentLineData = {
    labels: sentimentTrend.map(s => s.date),
    datasets: [
      {
        label: 'Avg Trust Score',
        data: sentimentTrend.map(s => s.avg_trust),
        borderColor: '#4D96FF',
        backgroundColor: 'rgba(77, 150, 255, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
      },
      {
        label: 'Avg Sentiment',
        data: sentimentTrend.map(s => (s.avg_sentiment || 0) * 100),
        borderColor: '#B983FF',
        backgroundColor: 'rgba(185, 131, 255, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
      },
    ],
  };

  const trustDistData = {
    labels: trustDist.map(t => t.bucket),
    datasets: [{
      label: 'Reviews',
      data: trustDist.map(t => t.count),
      backgroundColor: ['#6BCB77', '#FFD93D', '#FF6B6B'],
      borderColor: '#111111',
      borderWidth: 2,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { font: { weight: 'bold', family: 'Inter' } } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { font: { weight: 'bold' } } },
      x: { ticks: { font: { weight: 'bold', size: 10 } } },
    },
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-3xl font-black">Analytics</h1>
        <p className="text-sm opacity-60 font-bold">Trust Intelligence Dashboard</p>
      </div>

      {/* Row 1: Classification Pie + Trust Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="neo-card">
          <h3 className="font-black text-lg mb-4">Classification Distribution</h3>
          <div className="max-w-[280px] mx-auto">
            {classDist.length > 0 ? <Pie data={pieData} /> : <p className="text-center py-8 opacity-50">No data</p>}
          </div>
        </div>
        <div className="neo-card">
          <h3 className="font-black text-lg mb-4">Trust Score Distribution</h3>
          {trustDist.length > 0 ? (
            <Bar data={trustDistData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} />
          ) : <p className="text-center py-8 opacity-50">No data</p>}
        </div>
      </div>

      {/* Row 2: Sentiment Trend */}
      <div className="neo-card">
        <h3 className="font-black text-lg mb-4">Sentiment & Trust Trend</h3>
        {sentimentTrend.length > 0 ? (
          <Line data={sentimentLineData} options={chartOptions} />
        ) : <p className="text-center py-8 opacity-50">Not enough data for trend analysis</p>}
      </div>

      {/* Row 3: Product Trust + Top Reviewers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="neo-card">
          <h3 className="font-black text-lg mb-4">Product Authenticity Leaderboard</h3>
          {productTrust.length > 0 ? (
            <Bar data={productBarData} options={{ ...chartOptions, indexAxis: 'y', plugins: { legend: { display: false } } }} />
          ) : <p className="text-center py-8 opacity-50">No data</p>}
        </div>

        <div className="neo-card">
          <h3 className="font-black text-lg mb-4">Top Reviewers</h3>
          {topReviewers.length > 0 ? (
            <div className="space-y-3">
              {topReviewers.slice(0, 10).map((r, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`w-8 h-8 flex items-center justify-center font-black text-sm border-3 border-neo-text dark:border-white/30 rounded-md ${
                    i === 0 ? 'bg-neo-yellow' : i === 1 ? 'bg-gray-300' : i === 2 ? 'bg-orange-300' : 'bg-white dark:bg-neo-dark'
                  }`}>{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{r.username}</p>
                    <p className="text-xs opacity-50">{r.review_count} reviews</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black" style={{
                      color: r.credibility_score >= 75 ? '#6BCB77' : r.credibility_score >= 45 ? '#FFD93D' : '#FF6B6B'
                    }}>{Math.round(r.credibility_score)}</p>
                    <p className="text-xs opacity-50">credibility</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-center py-8 opacity-50">No data</p>}
        </div>
      </div>
    </div>
  );
}
