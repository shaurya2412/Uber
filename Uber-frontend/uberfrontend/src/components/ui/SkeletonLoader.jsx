import React from 'react';

const SkeletonLoader = ({
  shape = 'text',
  className = '',
  width,
  height,
}) => {
  const baseClasses = 'animate-shimmer rounded-lg';

  const shapeStyles = {
    text: 'h-4 w-full rounded',
    circle: 'w-12 h-12 rounded-full shrink-0',
    card: 'h-32 w-full rounded-2xl',
    button: 'h-11 w-full rounded-xl',
    pill: 'h-7 w-24 rounded-full',
  };

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`${baseClasses} ${shapeStyles[shape] || ''} ${className}`}
      style={style}
    />
  );
};

export default SkeletonLoader;
