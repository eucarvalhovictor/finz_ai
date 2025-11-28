
import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
  const sizeClasses = {
      sm: 'h-5 w-5 border-2',
      md: 'h-10 w-10 border-4',
      lg: 'h-16 w-16 border-4'
  };

  return (
    <div className="flex justify-center items-center w-full h-full p-4">
      <div className={`animate-spin rounded-full border-t-brand-primary border-r-transparent border-b-brand-primary border-l-transparent ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default Spinner;
