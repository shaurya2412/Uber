import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CountdownRing = ({
  duration = 10,
  size = 120,
  strokeWidth = 6,
  color = '#7C3AED',
  trailColor = '#1E1E2E',
  onTimeout,
  className = '',
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    setTimeLeft(duration);
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onTimeout?.();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onTimeout]);

  const strokeDashoffset = circumference * (1 - timeLeft / duration);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trailColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated countdown circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 8px ${color}80)`,
            transition: 'stroke-dashoffset 0.1s linear',
          }}
        />
      </svg>
      {/* Centered digital countdown display */}
      <div className="absolute flex flex-col items-center justify-center select-none">
        <span className="text-2xl font-black text-[#F8FAFC] tracking-tighter font-mono">
          {Math.ceil(timeLeft)}
        </span>
        <span className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-widest -mt-1">
          sec
        </span>
      </div>
    </div>
  );
};

export default CountdownRing;
