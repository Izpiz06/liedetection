import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../services/api';
import useStore from '../store/useStore';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.username || !form.email || !form.password) {
      setError('All fields are required');
      return;
    }
    if (form.username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authAPI.register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      addToast('Account created! Please sign in.', 'success');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="neo-card">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-neo-green border-4 border-neo-text dark:border-white/30 rounded-lg mx-auto mb-4 flex items-center justify-center shadow-neo">
            <UserPlus size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-black">Create Account</h1>
          <p className="text-sm opacity-60 font-medium mt-1">Join ReviewShield AI community</p>
        </div>

        {error && (
          <div className="bg-neo-red/10 border-3 border-neo-red text-neo-red px-4 py-3 mb-4 font-bold text-sm" style={{ borderRadius: '6px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-black mb-1">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="neo-input"
              placeholder="Choose a username"
            />
          </div>
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
                placeholder="Min 6 characters"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-black mb-1">Confirm Password</label>
            <input
              type="password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className="neo-input"
              placeholder="Repeat password"
            />
          </div>

          <button type="submit" disabled={loading} className="neo-btn-green w-full text-center !text-lg">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm font-bold mt-6 opacity-60">
          Already have an account?{' '}
          <Link to="/login" className="text-neo-blue underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
