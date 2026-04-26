import { Link } from 'react-router-dom';
import { Shield, ShieldCheck, AlertTriangle, TrendingUp, ArrowRight, Zap, Brain, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    analyticsAPI.overview().then(r => setStats(r.data.data)).catch(() => {});
  }, []);

  const features = [
    { icon: Brain, title: 'AI-Powered Detection', desc: 'Machine learning models analyze every review for authenticity signals', color: 'bg-neo-purple' },
    { icon: ShieldCheck, title: 'Trust Scoring', desc: 'Weighted scoring engine considers verified purchases, credibility, and behavior', color: 'bg-neo-green' },
    { icon: AlertTriangle, title: 'Fraud Alerts', desc: 'Automatic flagging of suspicious and deceptive reviews with explainable reasons', color: 'bg-neo-red' },
    { icon: Users, title: 'Community Moderation', desc: 'Crowdsourced reporting and helpfulness voting for collective trust signals', color: 'bg-neo-blue' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="px-4 md:px-8 py-16 md:py-24 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-neo-yellow border-4 border-neo-text shadow-neo mb-6" style={{ borderRadius: '6px' }}>
            <Zap size={18} />
            <span className="font-bold text-sm">Explainable AI-Powered Platform</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            Every Review,<br />
            <span className="text-neo-blue">Verified.</span>{' '}
            <span className="text-neo-green">Trusted.</span>{' '}
            <span className="text-neo-purple">Explained.</span>
          </h1>
          <p className="text-lg md:text-xl opacity-70 max-w-2xl mx-auto mb-8 font-medium">
            ReviewShield AI detects suspicious reviews, scores reviewer trustworthiness, and provides transparent moderation insights — so you can trust what you read.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="neo-btn-yellow text-lg !px-8 !py-4 flex items-center gap-2">
              Get Started <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="neo-btn bg-white dark:bg-neo-dark-card text-lg !px-8 !py-4">
              Sign In
            </Link>
          </div>
        </div>

        {/* Live Metrics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {[
              { label: 'Reviews Analyzed', value: stats.total_reviews || 0, color: 'bg-neo-blue' },
              { label: 'Suspicious Detected', value: stats.suspicious_count || 0, color: 'bg-neo-red' },
              { label: 'Avg Trust Score', value: `${Math.round(stats.avg_trust_score || 0)}%`, color: 'bg-neo-green' },
              { label: 'Active Users', value: stats.total_users || 0, color: 'bg-neo-purple' },
            ].map((stat, i) => (
              <div key={i} className="neo-card text-center animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className={`w-12 h-12 ${stat.color} border-3 border-neo-text dark:border-white/30 rounded-lg mx-auto mb-3 flex items-center justify-center shadow-neo-sm`}>
                  <TrendingUp size={20} className="text-white" />
                </div>
                <p className="text-3xl font-black">{stat.value}</p>
                <p className="text-sm font-bold opacity-60">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="px-4 md:px-8 py-16 bg-white dark:bg-neo-dark-card border-y-4 border-neo-text dark:border-white/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-12">
            How It <span className="text-neo-blue">Works</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="neo-card hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all">
                <div className={`w-14 h-14 ${f.color} border-3 border-neo-text dark:border-white/30 rounded-lg flex items-center justify-center shadow-neo-sm mb-4`}>
                  <f.icon size={24} className="text-white" />
                </div>
                <h3 className="font-black text-lg mb-2">{f.title}</h3>
                <p className="text-sm opacity-60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-8 py-16 max-w-4xl mx-auto text-center">
        <div className="neo-card bg-neo-yellow !border-neo-text">
          <h2 className="text-3xl font-black mb-4">Ready to Shield Your Reviews?</h2>
          <p className="opacity-70 mb-6 font-medium">Join ReviewShield AI and start building trust in product reviews today.</p>
          <Link to="/register" className="neo-btn bg-neo-text text-white !border-neo-text inline-flex items-center gap-2">
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-neo-text dark:border-white/20 px-4 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield size={20} className="text-neo-yellow" />
          <span className="font-black">ReviewShield AI</span>
        </div>
        <p className="text-sm opacity-50 font-medium">Explainable AI for Review Authenticity</p>
      </footer>
    </div>
  );
}
