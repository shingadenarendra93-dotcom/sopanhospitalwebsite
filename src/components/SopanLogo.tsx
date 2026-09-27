import React from 'react';

interface SopanLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  alt?: string;
}

export const SopanLogo: React.FC<SopanLogoProps> = ({
  className = '',
  size = 'md',
  alt = 'Sopan Hospital & Neurology Institute Logo'
}) => {
  const sizeMap = {
    xs: 'w-7 h-8',
    sm: 'w-9 h-10',
    md: 'w-11 h-12',
    lg: 'w-16 h-18',
    xl: 'w-24 h-28'
  };

  const selectedSizeClass = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/sopan-hospital-logo.svg"
        alt={alt}
        className={`${selectedSizeClass} object-contain transition-transform duration-200 drop-shadow-xs`}
        onError={(e) => {
          // Fallback to direct inline rendering if image load ever fails
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
};

export default SopanLogo;
