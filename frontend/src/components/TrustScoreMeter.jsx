import { useEffect, useState } from 'react';

export default function TrustScoreMeter({ score = 0, size = 120, label = 'Trust Score' }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    let start = 0;
    const step = score / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(start));
      }
    }, 25);
    return () => clearInterval(timer);
  }, [score]);

  const getColor = (s) => {
    if (s >= 75) return '#6BCB77';
    if (s >= 45) return '#FFD93D';
    return '#FF6B6B';
  };

  const color = getColor(animatedScore);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 100 100" className="transform -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8"
          className="text-gray-200 dark:text-gray-700" />
        <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute flex flex-col items-center justify-center"
        style={{ width: size, height: size }}>
        <span className="text-3xl font-black" style={{ color }}>{animatedScore}</span>
      </div>
      <span className="text-sm font-bold opacity-70">{label}</span>
    </div>
  );
}
