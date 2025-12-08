import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  return (
    <div className={`min-h-screen w-full max-w-[480px] mx-auto px-6 py-8 flex flex-col ${className}`}>
      {children}
    </div>
  );
};

export const FadeIn: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = "", delay = 0 }) => (
  <div 
    className={`animate-fade-in opacity-0 ${className}`}
    style={{ animation: `fadeIn 0.8s ease-out forwards ${delay}ms` }}
  >
    <style>{`
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
    {children}
  </div>
);