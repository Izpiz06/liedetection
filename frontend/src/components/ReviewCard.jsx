import { Star, ThumbsUp, Flag, BadgeCheck } from 'lucide-react';
import ClassificationBadge from './ClassificationBadge';
import { useNavigate } from 'react-router-dom';

export default function ReviewCard({ review }) {
  const navigate = useNavigate();
  const rating = review.rating || 0;
  const trustScore = review.analysis?.trust_score || review.trust_score || 0;
  const classification = review.flag?.classification || review.classification || 'genuine';

  return (
    <div
      className="neo-card cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all"
      onClick={() => navigate(`/review/${review.review_id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-neo-purple border-3 border-neo-text flex items-center justify-center text-white font-bold">
            {(review.username || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold">{review.username || 'Anonymous'}</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} className={s <= rating ? 'text-neo-yellow fill-neo-yellow' : 'text-gray-300'} />
              ))}
            </div>
          </div>
        </div>
        <ClassificationBadge classification={classification} size="sm" />
      </div>

      <p className="text-sm mb-3 line-clamp-3">{review.review_text}</p>

      <div className="flex items-center justify-between text-xs font-bold opacity-70">
        <div className="flex items-center gap-3">
          {review.verified_purchase && (
            <span className="flex items-center gap-1 text-neo-green">
              <BadgeCheck size={14} /> Verified
            </span>
          )}
          <span className="flex items-center gap-1">
            <ThumbsUp size={14} /> {review.helpful_votes || 0}
          </span>
          {review.report_count > 0 && (
            <span className="flex items-center gap-1 text-neo-red">
              <Flag size={14} /> {review.report_count}
            </span>
          )}
        </div>
        <span className="font-black text-base" style={{
          color: trustScore >= 75 ? '#6BCB77' : trustScore >= 45 ? '#FFD93D' : '#FF6B6B'
        }}>
          {Math.round(trustScore)}
        </span>
      </div>
    </div>
  );
}
