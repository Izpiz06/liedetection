import { Brain, ShieldCheck, AlertTriangle, FileWarning, UserX, Copy } from 'lucide-react';

const reasonIcons = {
  'verified': ShieldCheck,
  'credibility': UserX,
  'emotional': AlertTriangle,
  'duplicate': Copy,
  'report': FileWarning,
  'default': Brain,
};

function getIcon(text) {
  const lower = (text || '').toLowerCase();
  if (lower.includes('verified')) return reasonIcons.verified;
  if (lower.includes('credibility') || lower.includes('account')) return reasonIcons.credibility;
  if (lower.includes('emotional') || lower.includes('language') || lower.includes('toxicity')) return reasonIcons.emotional;
  if (lower.includes('duplicate') || lower.includes('similarity')) return reasonIcons.duplicate;
  if (lower.includes('report') || lower.includes('frequency')) return reasonIcons.report;
  return reasonIcons.default;
}

export default function ExplainabilityCard({ explanation, analysis }) {
  // Parse explanation string into reasons
  const reasons = explanation
    ? explanation.split(',').map(r => r.trim()).filter(Boolean)
    : [];

  // Add AI metric details if available
  const metrics = [];
  if (analysis) {
    if (analysis.sentiment_score !== undefined) {
      metrics.push({ label: 'Sentiment', value: analysis.sentiment_score, max: 1 });
    }
    if (analysis.toxicity_score !== undefined) {
      metrics.push({ label: 'Toxicity', value: analysis.toxicity_score, max: 1 });
    }
    if (analysis.duplicate_score !== undefined) {
      metrics.push({ label: 'Duplicate', value: analysis.duplicate_score, max: 1 });
    }
    if (analysis.anomaly_score !== undefined) {
      metrics.push({ label: 'Anomaly', value: analysis.anomaly_score, max: 1 });
    }
  }

  return (
    <div className="neo-card bg-neo-bg dark:bg-neo-dark">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="text-neo-purple" size={20} />
        <h3 className="font-black text-lg">AI Explainability</h3>
      </div>

      {reasons.length > 0 && (
        <div className="space-y-2 mb-4">
          {reasons.map((reason, i) => {
            const Icon = getIcon(reason);
            return (
              <div key={i} className="flex items-start gap-3 p-3 bg-white dark:bg-neo-dark-card border-3 border-neo-text dark:border-white/20 rounded-md">
                <Icon size={18} className="text-neo-blue mt-0.5 flex-shrink-0" />
                <span className="text-sm font-semibold">{reason}</span>
              </div>
            );
          })}
        </div>
      )}

      {metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m, i) => (
            <div key={i} className="text-center">
              <p className="text-xs font-bold opacity-60 mb-1">{m.label}</p>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    m.value > 0.7 ? 'bg-neo-red' : m.value > 0.4 ? 'bg-neo-yellow' : 'bg-neo-green'
                  }`}
                  style={{ width: `${(m.value / m.max) * 100}%` }}
                />
              </div>
              <p className="text-xs font-bold mt-1">{(m.value * 100).toFixed(0)}%</p>
            </div>
          ))}
        </div>
      )}

      {analysis?.model_version && (
        <p className="text-xs opacity-50 mt-3 font-bold">Model: {analysis.model_version}</p>
      )}
    </div>
  );
}
