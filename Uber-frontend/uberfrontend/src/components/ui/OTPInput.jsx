import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

const OTPInput = ({
  length = 6,
  value = '',
  onChange,
  onComplete,
  isError = false,
  isSuccess = false,
  disabled = false,
  className = '',
}) => {
  const [digits, setDigits] = useState(
    Array(length)
      .fill('')
      .map((_, i) => value[i] || '')
  );
  const inputRefs = useRef([]);

  useEffect(() => {
    const newDigits = Array(length)
      .fill('')
      .map((_, i) => value[i] || '');
    setDigits(newDigits);
  }, [value, length]);

  const handleChange = (e, index) => {
    const rawVal = e.target.value;
    const char = rawVal.replace(/\D/g, '').slice(-1); // Only take last typed digit

    const updated = [...digits];
    updated[index] = char;
    setDigits(updated);

    const fullCode = updated.join('');
    onChange?.(fullCode);

    // Auto-focus next box if entered a digit
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (updated.every((d) => d !== '') && fullCode.length === length) {
      onComplete?.(fullCode);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move to previous box if current is empty
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;

    const updated = [...digits];
    for (let i = 0; i < length; i++) {
      updated[i] = pasted[i] || '';
    }
    setDigits(updated);
    const fullCode = updated.join('');
    onChange?.(fullCode);

    const nextIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[nextIndex]?.focus();

    if (pasted.length === length) {
      onComplete?.(fullCode);
    }
  };

  return (
    <motion.div
      animate={isError ? { x: [-10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex items-center justify-center gap-2 sm:gap-3 relative ${className}`}
    >
      {digits.map((digit, index) => {
        const isFocused = false;
        let borderStyle = 'border-[#2D2D3F] focus:border-[#7C3AED]';
        let glowStyle = 'focus:ring-2 focus:ring-[#7C3AED]/30';

        if (isError) {
          borderStyle = 'border-[#EF4444] text-[#EF4444]';
          glowStyle = 'ring-2 ring-[#EF4444]/30';
        } else if (isSuccess) {
          borderStyle = 'border-[#10B981] text-[#10B981]';
          glowStyle = 'ring-2 ring-[#10B981]/30';
        }

        return (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            disabled={disabled}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl font-bold rounded-xl bg-[#111118] text-[#F8FAFC] border outline-none transition-all ${borderStyle} ${glowStyle} disabled:opacity-50`}
          />
        );
      })}

      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -right-8 bg-[#10B981] text-[#0A0A0F] p-1 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"
          >
            <Check className="w-4 h-4 stroke-[3]" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OTPInput;
