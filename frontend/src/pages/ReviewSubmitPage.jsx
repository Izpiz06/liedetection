import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, Send, Monitor, Smartphone, Laptop } from 'lucide-react';
import { reviewsAPI, productsAPI } from '../services/api';
import useStore from '../store/useStore';

export default function ReviewSubmitPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    product_id: searchParams.get('product') || '',
    review_text: '',
    rating: 0,
    verified_purchase: false,
    device_type: 'web',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    productsAPI.getAll({}).then(r => setProducts(r.data.data.products)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.product_id) { setError('Please select a product'); return; }
    if (!form.rating) { setError('Please select a rating'); return; }
    if (form.review_text.length < 10) { setError('Review must be at least 10 characters'); return; }

    setLoading(true);
    try {
      const res = await reviewsAPI.create({
        ...form,
        product_id: parseInt(form.product_id),
      });
      setResult(res.data.data);
      addToast('Review submitted successfully!', 'success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const devices = [
    { value: 'web', icon: Monitor, label: 'Desktop' },
    { value: 'mobile', icon: Smartphone, label: 'Mobile' },
    { value: 'tablet', icon: Laptop, label: 'Tablet' },
  ];

  if (result) {
    const trustScore = result.trust_score || 0;
    const classification = result.classification || 'genuine';
    return (
      <div className="max-w-lg mx-auto animate-bounce-in">
        <div className="neo-card text-center">
          <div className={`w-24 h-24 mx-auto mb-4 border-4 border-neo-text dark:border-white/30 rounded-full flex items-center justify-center shadow-neo ${
            classification === 'genuine' ? 'bg-neo-green' : classification === 'suspicious' ? 'bg-neo-yellow' : 'bg-neo-red'
          }`}>
            <span className="text-3xl font-black text-white">{Math.round(trustScore)}</span>
          </div>
          <h2 className="text-2xl font-black mb-2">Review Submitted!</h2>
          <p className="font-bold opacity-60 mb-4">
            Your review was classified as{' '}
            <span className={`font-black ${
              classification === 'genuine' ? 'text-neo-green' : classification === 'suspicious' ? 'text-neo-yellow' : 'text-neo-red'
            }`}>{classification}</span>
            {' '}with a trust score of <span className="font-black">{Math.round(trustScore)}</span>
          </p>
          <div className="flex justify-center gap-3">
            <button onClick={() => navigate(`/review/${result.review_id}`)} className="neo-btn-blue">
              View Analysis
            </button>
            <button onClick={() => { setResult(null); setForm({ ...form, review_text: '', rating: 0 }); }} className="neo-btn-yellow">
              Write Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      <div>
        <h1 className="text-3xl font-black">Write a Review</h1>
        <p className="text-sm opacity-60 font-bold">Share your honest experience</p>
      </div>

      {error && (
        <div className="bg-neo-red/10 border-3 border-neo-red text-neo-red px-4 py-3 font-bold text-sm" style={{ borderRadius: '6px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product select */}
        <div className="neo-card">
          <label className="block text-sm font-black mb-2">Select Product</label>
          <select
            value={form.product_id}
            onChange={(e) => setForm({ ...form, product_id: e.target.value })}
            className="neo-input"
          >
            <option value="">Choose a product...</option>
            {products.map(p => (
              <option key={p.product_id} value={p.product_id}>
                {p.product_name} ({p.brand})
              </option>
            ))}
          </select>
        </div>

        {/* Rating */}
        <div className="neo-card">
          <label className="block text-sm font-black mb-3">Your Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setForm({ ...form, rating: s })}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  size={36}
                  className={`${s <= form.rating ? 'text-neo-yellow fill-neo-yellow' : 'text-gray-300'} transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Review text */}
        <div className="neo-card">
          <label className="block text-sm font-black mb-2">Your Review</label>
          <textarea
            value={form.review_text}
            onChange={(e) => setForm({ ...form, review_text: e.target.value })}
            className="neo-input !h-32 resize-none"
            placeholder="Share your detailed experience with this product..."
          />
          <p className="text-xs font-bold opacity-40 mt-1">{form.review_text.length} characters (min 10)</p>
        </div>

        {/* Options row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Verified purchase */}
          <div className="neo-card">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.verified_purchase}
                onChange={(e) => setForm({ ...form, verified_purchase: e.target.checked })}
                className="w-5 h-5 border-3 border-neo-text rounded"
              />
              <span className="font-black text-sm">Verified Purchase</span>
            </label>
          </div>

          {/* Device type */}
          <div className="neo-card">
            <p className="font-black text-sm mb-2">Device</p>
            <div className="flex gap-2">
              {devices.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setForm({ ...form, device_type: d.value })}
                  className={`flex-1 py-2 border-3 border-neo-text dark:border-white/30 text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    form.device_type === d.value ? 'bg-neo-blue text-white shadow-neo-sm' : 'bg-white dark:bg-neo-dark-card'
                  }`}
                  style={{ borderRadius: '4px' }}
                >
                  <d.icon size={16} />
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="neo-btn-green w-full text-center !text-lg flex items-center justify-center gap-2">
          <Send size={20} />
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
