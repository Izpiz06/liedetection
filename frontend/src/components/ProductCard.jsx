import { useNavigate } from 'react-router-dom';
import { ShieldCheck, MessageSquare, AlertTriangle, ExternalLink } from 'lucide-react';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const trustScore = product.overall_trust_score || 50;
  const authenticity = product.authenticity_percent || 100;

  const getTrustColor = (s) => {
    if (s >= 75) return 'bg-neo-green';
    if (s >= 45) return 'bg-neo-yellow';
    return 'bg-neo-red';
  };

  return (
    <div
      className="neo-card cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover transition-all"
      onClick={() => navigate(`/products/${product.product_id}`)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-black text-lg leading-tight">{product.product_name}</h3>
          <p className="text-sm font-bold opacity-60">{product.brand} · {product.category}</p>
          {product.product_link && (
            <p className="text-xs text-neo-blue font-bold flex items-center gap-1 mt-1 truncate">
              <ExternalLink size={11} />
              {product.product_link.replace(/^https?:\/\//, '').substring(0, 35)}...
            </p>
          )}
        </div>
        <span className="neo-badge bg-neo-blue text-white text-xs">
          {product.price ? `₹${product.price.toLocaleString()}` : 'N/A'}
        </span>
      </div>

      {product.description && (
        <p className="text-xs opacity-60 mb-3 line-clamp-2">{product.description}</p>
      )}

      {/* Trust Score Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs font-bold mb-1">
          <span>Trust Score</span>
          <span>{Math.round(trustScore)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 border-2 border-neo-text dark:border-white/30 rounded-sm overflow-hidden">
          <div className={`h-full ${getTrustColor(trustScore)} transition-all duration-700`}
            style={{ width: `${trustScore}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-bold">
        <span className="flex items-center gap-1">
          <ShieldCheck size={14} className="text-neo-green" />
          {Math.round(authenticity)}% authentic
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare size={14} />
          {product.total_reviews || 0} reviews
        </span>
        {product.flagged_reviews > 0 && (
          <span className="flex items-center gap-1 text-neo-red">
            <AlertTriangle size={14} />
            {product.flagged_reviews} flagged
          </span>
        )}
      </div>
    </div>
  );
}
