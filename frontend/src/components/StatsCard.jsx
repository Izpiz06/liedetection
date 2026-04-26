export default function StatsCard({ icon: Icon, label, value, color = 'bg-neo-yellow', subtitle }) {
  return (
    <div className="neo-card flex items-center gap-4">
      <div className={`w-14 h-14 ${color} border-3 border-neo-text dark:border-white/30 rounded-lg flex items-center justify-center shadow-neo-sm dark:shadow-neo-dark-sm flex-shrink-0`}>
        <Icon size={24} className="text-neo-text" />
      </div>
      <div>
        <p className="text-3xl font-black leading-none">{value}</p>
        <p className="text-sm font-bold opacity-60">{label}</p>
        {subtitle && <p className="text-xs opacity-40">{subtitle}</p>}
      </div>
    </div>
  );
}
