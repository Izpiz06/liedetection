import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, PenSquare, Star } from 'lucide-react';
import { productsAPI } from '../services/api';
import TrustScoreMeter from '../components/TrustScoreMeter';
import ReviewCard from '../components/ReviewCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    productsAPI.getReviews(id, { sort })
      .then(res => {
        setProduct(res.data.data.product);
        setReviews(res.data.data.reviews);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, sort]);

  if (loading) return <LoadingSpinner text="Loading product..." />;
  if (!product) return <div className="neo-card text-center py-12">Product not found</div>;

  const trustScore = product.overall_trust_score || 50;
  const authenticity = product.authenticity_percent || 100;

  // Rating distribution
  const ratingDist = [5, 4, 3, 2, 1].map(r => ({
    stars: r,
    count: reviews.filter(rv => rv.rating === r).length,
    pct: reviews.length > 0 ? (reviews.filter(rv => rv.rating === r).length / reviews.length) * 100 : 0,
  }));

  return (
    <div className="space-y-6 animate-slide-up">
      <Link to="/products" className="inline-flex items-center gap-2 font-bold text-sm opacity-60 hover:opacity-100 transition-opacity">
        <ArrowLeft size={16} /> Back to Products
      </Link>

      {/* Product Header */}
      <div className="neo-card">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <span className="neo-badge bg-neo-blue text-white text-xs mb-2">{product.category}</span>
            <h1 className="text-3xl font-black mb-1">{product.product_name}</h1>
            <p className="font-bold opacity-60 mb-2">{product.brand}</p>
            {product.description && <p className="text-sm opacity-50 mb-3">{product.description}</p>}
            <div className="flex flex-wrap gap-3 text-sm font-bold">
              {product.price && (
                <span className="neo-badge bg-neo-green text-white">
                  ₹{product.price.toLocaleString()}
                </span>
              )}
              <span className="neo-badge bg-neo-yellow">
                {product.total_reviews} reviews
              </span>
              {product.flagged_reviews > 0 && (
                <span className="neo-badge bg-neo-red text-white">
                  {product.flagged_reviews} flagged
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <TrustScoreMeter score={trustScore} size={140} label="Trust Score" />
            </div>
            <div className="text-center">
              <p className="font-black text-2xl text-neo-green">{Math.round(authenticity)}%</p>
              <p className="text-xs font-bold opacity-50">Authenticity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="neo-card">
        <h3 className="font-black text-lg mb-4">Rating Distribution</h3>
        <div className="space-y-2">
          {ratingDist.map(r => (
            <div key={r.stars} className="flex items-center gap-3">
              <span className="flex items-center gap-1 w-14 font-bold text-sm">
                {r.stars} <Star size={12} className="text-neo-yellow fill-neo-yellow" />
              </span>
              <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 border-2 border-neo-text dark:border-white/20 rounded-sm overflow-hidden">
                <div className="h-full bg-neo-yellow transition-all duration-700" style={{ width: `${r.pct}%` }} />
              </div>
              <span className="w-8 text-right font-bold text-sm">{r.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-lg">Reviews ({reviews.length})</h3>
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="neo-input !w-auto !py-2 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
            <Link to={`/review/submit?product=${id}`} className="neo-btn-green !py-2 !px-4 text-sm flex items-center gap-1">
              <PenSquare size={14} /> Write Review
            </Link>
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map(r => (
              <ReviewCard key={r.review_id} review={r} />
            ))}
          </div>
        ) : (
          <div className="neo-card text-center py-8 opacity-50">
            <p className="font-bold">No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>
    </div>
  );
}
