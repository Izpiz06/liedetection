import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import useStore from '../store/useStore';

const toastConfig = {
  success: { bg: 'bg-neo-green', icon: CheckCircle },
  error: { bg: 'bg-neo-red', icon: XCircle },
  warning: { bg: 'bg-neo-yellow', icon: AlertTriangle },
  info: { bg: 'bg-neo-blue', icon: Info },
};

export default function Toast() {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const config = toastConfig[toast.type] || toastConfig.info;
        const Icon = config.icon;
        return (
          <div
            key={toast.id}
            className={`${config.bg} border-4 border-neo-text dark:border-white/30 shadow-neo dark:shadow-neo-dark px-5 py-3 flex items-center gap-3 animate-slide-in min-w-[300px] max-w-[420px]`}
            style={{ borderRadius: '6px' }}
          >
            <Icon size={20} className="flex-shrink-0" />
            <span className="font-bold text-sm flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="flex-shrink-0 hover:opacity-60">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
