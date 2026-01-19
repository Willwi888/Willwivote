
import React, { useMemo } from 'react';

const SNOWFLAKE_COUNT = 70;

const Snowflake: React.FC = () => {
    const config = useMemo(() => {
        const size = Math.random() * 5 + 2; // 2-7px
        const left = Math.random() * 100; // 0-100%
        const delay = Math.random() * 20;
        const duration = Math.random() * 15 + 10; // 10-25s
        const isGold = Math.random() > 0.85;
        const opacity = Math.random() * 0.5 + 0.3;
        const drift = (Math.random() - 0.5) * 150; // Horizontal drift pixels

        return {
            style: {
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: isGold ? '#FFD700' : '#FFFFFF',
                left: `${left}%`,
                top: `-10px`,
                opacity: opacity,
                boxShadow: isGold ? '0 0 8px rgba(255, 215, 0, 0.6)' : '0 0 5px rgba(255, 255, 255, 0.4)',
                animation: `snow-fall ${duration}s linear ${delay}s infinite`,
                '--drift': `${drift}px`,
                filter: isGold ? 'blur(0.5px)' : 'blur(1px)',
            } as React.CSSProperties
        };
    }, []);

    return (
        <div 
            className="absolute rounded-full pointer-events-none z-0"
            style={config.style}
        />
    );
};

export const Snowfall: React.FC = () => {
    const snowflakes = useMemo(() => Array.from({ length: SNOWFLAKE_COUNT }), []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
            {snowflakes.map((_, i) => (
                <Snowflake key={i} />
            ))}
        </div>
    );
};
