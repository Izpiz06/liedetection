import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../services/api';
import useStore from '../store/useStore';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth, addToast } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      setAuth(res.data.data.user, res.data.data.token);
      addToast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="neo-card">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-neo-blue border-4 border-neo-text dark:border-white/30 rounded-lg mx-auto mb-4 flex items-center justify-center shadow-neo">
            <LogIn size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-black">Welcome Back</h1>
          <p className="text-sm opacity-60 font-medium mt-1">Sign in to your ReviewShield account</p>
        </div>

        {error && (
          <div className="bg-neo-red/10 border-3 border-neo-red text-neo-red px-4 py-3 mb-4 font-bold text-sm" style={{ borderRadius: '6px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-black mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="neo-input"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-black mb-1">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="neo-input pr-12"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="neo-btn-blue w-full text-center !text-lg">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm font-bold mt-6 opacity-60">
          Don't have an account?{' '}
          <Link to="/register" className="text-neo-blue underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
