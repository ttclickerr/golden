import React from 'react';

interface GradientBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

// Компонент для создания градиентного фона в стиле оригинального WealthTycoon
const GradientBackground: React.FC<GradientBackgroundProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={`min-h-screen w-full bg-gradient-to-br from-[#3a235b] via-[#511d4c] to-[#1a1a2e] ${className}`}
    >
      {children}
    </div>
  );
};

export default GradientBackground;