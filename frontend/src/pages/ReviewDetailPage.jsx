import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, ThumbsUp, ThumbsDown, Flag, BadgeCheck, Clock, Smartphone } from 'lucide-react';
import { reviewsAPI } from '../services/api';
import TrustScoreMeter from '../components/TrustScoreMeter';
import ClassificationBadge from '../components/ClassificationBadge';
import ExplainabilityCard from '../components/ExplainabilityCard';
import LoadingSpinner from '../components/LoadingSpinner';
import useStore from '../store/useStore';

export default function ReviewDetailPage() {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const { isAuthenticated, addToast } = useStore();

  useEffect(() => {
    reviewsAPI.getById(id)
      .then(r => setReview(r.data.data.review))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleVote = async (type) => {
    if (!isAuthenticated) { addToast('Please login to vote', 'warning'); return; }
    try {
      await reviewsAPI.vote(id, { vote: type });
      // Refresh
      const r = await reviewsAPI.getById(id);
      setReview(r.data.data.review);
      addToast('Vote recorded!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Vote failed', 'error');
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) { addToast('Please enter a reason', 'warning'); return; }
    try {
      await reviewsAPI.report(id, { reason: reportReason });
      addToast('Review reported', 'success');
      setReportOpen(false);
      setReportReason('');
      const r = await reviewsAPI.getById(id);
      setReview(r.data.data.review);
    } catch (err) {
      addToast(err.response?.data?.message || 'Report failed', 'error');
    }
  };

  if (loading) return <LoadingSpinner text="Loading review..." />;
  if (!review) return <div className="neo-card text-center py-12 font-bold">Review not found</div>;

  const analysis = review.analysis;
  const flag = review.flag;
  const trustScore = analysis?.trust_score || 0;
  const classification = flag?.classification || 'genuine';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      <Link to={`/products/${review.product_id}`} className="inline-flex items-center gap-2 font-bold text-sm opacity-60 hover:opacity-100">
        <ArrowLeft size={16} /> Back to Product
      </Link>

      {/* Review Header */}
      <div className="neo-card">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-neo-purple border-3 border-neo-text dark:border-white/30 flex items-center justify-center text-white font-black text-lg">
                {(review.username || 'U')[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg">{review.username}</span>
                  {review.user_verified && (
                    <BadgeCheck size={18} className="text-neo-blue" />
                  )}
                </div>
                <p className="text-xs font-bold opacity-50">
                  Credibility: {Math.round(review.user_credibility || 50)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={20} className={s <= review.rating ? 'text-neo-yellow fill-neo-yellow' : 'text-gray-300'} />
              ))}
              <ClassificationBadge classification={classification} />
            </div>

            <p className="mb-4 leading-relaxed">{review.review_text}</p>

            <div className="flex flex-wrap gap-3 text-xs font-bold opacity-50">
              {review.verified_purchase && (
                <span className="flex items-center gap-1 text-neo-green opacity-100">
                  <BadgeCheck size={14} /> Verified Purchase
                </span>
              )}
              {review.product_name && <span>Product: {review.product_name}</span>}
              {review.device_type && (
                <span className="flex items-center gap-1"><Smartphone size={12} /> {review.device_type}</span>
              )}
              {review.created_at && (
                <span className="flex items-center gap-1"><Clock size={12} /> {new Date(review.created_at).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          {/* Trust Score Meter */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <TrustScoreMeter score={trustScore} size={160} label="Trust Score" />
            </div>
            {flag && (
              <div className="text-center mt-2">
                <p className="text-xs font-bold opacity-50">Confidence</p>
                <p className="font-black text-lg">{Math.round(flag.confidence_score || 0)}%</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Explainability */}
      {analysis && (
        <ExplainabilityCard
          explanation={analysis.explanation}
          analysis={analysis}
        />
      )}

      {/* Actions */}
      <div className="neo-card">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => handleVote('helpful')}
            className="neo-btn-green !py-2 !px-4 text-sm flex items-center gap-2"
          >
            <ThumbsUp size={16} /> Helpful ({review.votes?.helpful || 0})
          </button>
          <button
            onClick={() => handleVote('not_helpful')}
            className="neo-btn bg-gray-200 dark:bg-gray-700 !py-2 !px-4 text-sm flex items-center gap-2"
          >
            <ThumbsDown size={16} /> Not Helpful ({review.votes?.not_helpful || 0})
          </button>
          <button
            onClick={() => setReportOpen(!reportOpen)}
            className="neo-btn-red !py-2 !px-4 text-sm flex items-center gap-2"
          >
            <Flag size={16} /> Report
          </button>
        </div>

        {reportOpen && (
          <div className="mt-4 space-y-3 animate-slide-up">
            <input
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="neo-input"
              placeholder="Why are you reporting this review?"
            />
            <div className="flex gap-2">
              <button onClick={handleReport} className="neo-btn-red !py-2 !px-4 text-sm">Submit Report</button>
              <button onClick={() => setReportOpen(false)} className="neo-btn !py-2 !px-4 text-sm bg-gray-200">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Flag Details */}
      {flag && (
        <div className="neo-card">
          <h3 className="font-black text-lg mb-3">Flag Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-bold opacity-50">Severity</p>
              <span className={`neo-badge text-xs ${
                flag.severity === 'high' ? 'bg-neo-red text-white' : flag.severity === 'medium' ? 'bg-neo-yellow' : 'bg-neo-green text-white'
              }`}>{flag.severity}</span>
            </div>
            <div>
              <p className="font-bold opacity-50">Rule Triggered</p>
              <p className="font-bold">{flag.rule_triggered || 'N/A'}</p>
            </div>
            <div>
              <p className="font-bold opacity-50">Admin Reviewed</p>
              <p className="font-bold">{flag.reviewed_by_admin ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="font-bold opacity-50">Resolution</p>
              <p className="font-bold">{flag.resolution_status}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
