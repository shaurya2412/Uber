import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const RatingStars = ({
  rating = 0,
  maxStars = 5,
  onChange,
  readOnly = false,
  size = 24,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const activeRating = hoverRating || rating;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= activeRating;

        return (
          <motion.button
            key={index}
            type="button"
            disabled={readOnly}
            whileHover={readOnly ? {} : { scale: 1.25, rotate: 5 }}
            whileTap={readOnly ? {} : { scale: 0.9 }}
            onClick={() => !readOnly && onChange?.(starValue)}
            onMouseEnter={() => !readOnly && setHoverRating(starValue)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            className={`transition-colors focus:outline-none ${
              readOnly ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <Star
              size={size}
              className={`transition-all duration-200 ${
                isFilled
                  ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                  : 'fill-transparent text-[#475569]'
              }`}
            />
          </motion.button>
        );
      })}
    </div>
  );
};

export default RatingStars;
