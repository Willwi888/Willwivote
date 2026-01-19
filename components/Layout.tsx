
import React from 'react';
import { Snowfall } from './Snowfall';

// Shared background state for the cinematic blur
export const BackgroundContext = React.createContext<{
  setBgImage: (url: string | null) => void;
}>({ setBgImage: () => {} });

export const Layout: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  const [bgImage, setBgImage] = React.useState<string | null>(null);

  return (
    <BackgroundContext.Provider value={{ setBgImage }}>
      {bgImage && (
        <div 
          className="cinematic-backdrop" 
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}
      
      {/* Christmas Snowfall Effect Layer */}
      <Snowfall />

      {/* 
         UPDATED: Removed max-w-[500px] and mx-auto constraints. 
         Now uses w-full to allow full-screen immersive design on desktop.
      */}
      <div className={`min-h-screen w-full relative z-10 ${className}`}>
        {children}
      </div>
    </BackgroundContext.Provider>
  );
};

export const FadeIn: React.FC<{ 
  children?: React.ReactNode; 
  className?: string; 
  delay?: number;
  direction?: 'up' | 'none';
}> = ({ children, className = "", delay = 0, direction = 'up' }) => (
  <div 
    className={`${direction === 'up' ? 'animate-slide-up' : 'animate-fade-in'} opacity-0 ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);
