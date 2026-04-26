import { Shield, ShieldAlert, ShieldX } from 'lucide-react';

const badgeConfig = {
  genuine: {
    bg: 'bg-neo-green',
    text: 'text-white',
    icon: Shield,
    label: 'Genuine',
  },
  suspicious: {
    bg: 'bg-neo-yellow',
    text: 'text-neo-text',
    icon: ShieldAlert,
    label: 'Suspicious',
  },
  deceptive: {
    bg: 'bg-neo-red',
    text: 'text-white',
    icon: ShieldX,
    label: 'Deceptive',
  },
};

export default function ClassificationBadge({ classification = 'genuine', showIcon = true, size = 'md' }) {
  const config = badgeConfig[classification] || badgeConfig.genuine;
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`neo-badge ${config.bg} ${config.text} ${sizeClasses} inline-flex items-center gap-1.5`}>
      {showIcon && <Icon size={size === 'sm' ? 12 : 16} />}
      {config.label}
    </span>
  );
}
