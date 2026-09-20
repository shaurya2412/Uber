import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: {
    bg: 'bg-[#10B981]/15',
    border: 'border-[#10B981]/30',
    text: 'text-[#10B981]',
    iconColor: '#10B981',
  },
  error: {
    bg: 'bg-[#EF4444]/15',
    border: 'border-[#EF4444]/30',
    text: 'text-[#EF4444]',
    iconColor: '#EF4444',
  },
  warning: {
    bg: 'bg-[#F59E0B]/15',
    border: 'border-[#F59E0B]/30',
    text: 'text-[#F59E0B]',
    iconColor: '#F59E0B',
  },
  info: {
    bg: 'bg-[#06B6D4]/15',
    border: 'border-[#06B6D4]/30',
    text: 'text-[#06B6D4]',
    iconColor: '#06B6D4',
  },
};

const Toast = ({
  message,
  type = 'info',
  isVisible = true,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose]);

  const Icon = icons[type] || icons.info;
  const style = styles[type] || styles.info;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] bg-[#111118]/95 ${style.border} max-w-md`}
        >
          <div className={`p-1.5 rounded-lg ${style.bg}`}>
            <Icon className="w-5 h-5" style={{ color: style.iconColor }} />
          </div>
          <p className="text-sm font-medium text-[#F8FAFC] flex-1">{message}</p>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F8FAFC] p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
