import React from 'react';

const statusConfig = {
  requested: {
    label: 'Finding Driver',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
    pulse: true,
  },
  pending: {
    label: 'Finding Driver',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
    pulse: true,
  },
  accepted: {
    label: 'Driver Accepted',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    dot: 'bg-cyan-400',
    pulse: false,
  },
  driver_en_route: {
    label: 'Driver En Route',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    dot: 'bg-purple-400',
    pulse: true,
  },
  arrived: {
    label: 'Driver Arrived',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
    dot: 'bg-indigo-400',
    pulse: true,
  },
  in_ride: {
    label: 'Trip in Progress',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    pulse: true,
  },
  in_progress: {
    label: 'Trip in Progress',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    pulse: true,
  },
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    pulse: false,
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    dot: 'bg-red-400',
    pulse: false,
  },
};

const RideStatusBadge = ({ status, className = '' }) => {
  const normalizedStatus = status?.toLowerCase() || 'requested';
  const config = statusConfig[normalizedStatus] || {
    label: normalizedStatus.replace(/_/g, ' '),
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    text: 'text-slate-300',
    dot: 'bg-slate-400',
    pulse: false,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border backdrop-blur-md ${config.bg} ${config.border} ${config.text} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {config.pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
      </span>
      <span>{config.label}</span>
    </span>
  );
};

export default RideStatusBadge;
