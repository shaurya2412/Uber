import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const AnimatedCounter = ({ targetValue, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const numericTarget = typeof targetValue === 'number' 
    ? targetValue 
    : parseFloat(String(targetValue).replace(/[^0-9.-]+/g, '')) || 0;

  useEffect(() => {
    let start = 0;
    const duration = 1200; // ms
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (numericTarget - start) * easeProgress;
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(numericTarget);
      }
    };

    requestAnimationFrame(animate);
  }, [numericTarget]);

  const formatted = numericTarget % 1 === 0 
    ? Math.round(count).toLocaleString() 
    : count.toFixed(2);

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  prefix = '',
  suffix = '',
  trend,
  trendLabel = 'vs last period',
  accentColor = '#7C3AED',
  className = '',
}) => {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className={`glass-card rounded-2xl p-5 border border-[#1E1E2E] hover:border-[#2D2D3F] transition-all relative overflow-hidden group ${className}`}
    >
      {/* Ambient background glow on hover */}
      <div
        className="absolute -right-10 -top-10 w-28 h-28 rounded-full opacity-10 group-hover:opacity-20 blur-2xl transition-opacity pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
          {label}
        </span>
        {Icon && (
          <div
            className="p-2.5 rounded-xl border border-white/5"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <Icon className="w-5 h-5" style={{ color: accentColor }} />
          </div>
        )}
      </div>

      <div className="text-2xl lg:text-3xl font-bold text-[#F8FAFC] tracking-tight">
        <AnimatedCounter targetValue={value} prefix={prefix} suffix={suffix} />
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1.5 mt-3 text-xs">
          <span
            className={`inline-flex items-center font-semibold px-2 py-0.5 rounded-full ${
              isPositive
                ? 'bg-[#10B981]/15 text-[#10B981]'
                : isNegative
                ? 'bg-[#EF4444]/15 text-[#EF4444]'
                : 'bg-slate-500/15 text-slate-400'
            }`}
          >
            {isPositive && <TrendingUp className="w-3 h-3 mr-1" />}
            {isNegative && <TrendingDown className="w-3 h-3 mr-1" />}
            {isPositive ? `+${trend}%` : `${trend}%`}
          </span>
          <span className="text-[#475569]">{trendLabel}</span>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
