
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 rounded-full bg-brand-secondary animate-pulse"></div>
        <div className="w-4 h-4 rounded-full bg-brand-secondary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-4 h-4 rounded-full bg-brand-secondary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
    </div>
  );
};

export default Loader;
