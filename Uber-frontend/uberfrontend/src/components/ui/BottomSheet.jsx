import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const BottomSheet = ({
  isOpen = true,
  onClose,
  title,
  children,
  className = '',
  showHandle = true,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 z-40 lg:static lg:z-auto pointer-events-auto">
          {/* Mobile backdrop if overlay desired */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className={`glass-card-elevated rounded-t-3xl lg:rounded-2xl border-t lg:border border-[#2D2D3F] p-5 pb-8 lg:p-6 shadow-[0_-15px_40px_rgba(0,0,0,0.6)] lg:shadow-[0_10px_30px_rgba(0,0,0,0.4)] max-h-[85vh] overflow-y-auto ${className}`}
          >
            {/* Grab Handle for mobile */}
            {showHandle && (
              <div className="w-12 h-1.5 bg-[#2D2D3F] rounded-full mx-auto mb-4 lg:hidden" />
            )}

            {title && (
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1E1E2E]">
                <h3 className="font-bold text-base text-[#F8FAFC] tracking-tight">{title}</h3>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A1A24] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            <div className="space-y-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
