import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-neo-text dark:border-white/30 border-t-neo-yellow rounded-full animate-spin" />
        <Loader2 className="absolute inset-0 m-auto text-neo-yellow animate-pulse" size={24} />
      </div>
      <p className="font-bold text-sm opacity-60">{text}</p>
    </div>
  );
}
