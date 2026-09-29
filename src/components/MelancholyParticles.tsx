import React, { useMemo } from 'react';

interface Particle {
  id: number;
  left: string;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
  color: string;
  opacity: number;
}

interface MelancholyParticlesProps {
  extraDark?: boolean;
}

export const MelancholyParticles: React.FC<MelancholyParticlesProps> = ({ extraDark }) => {
  // Pre-generate stable particle attributes
  const particles: Particle[] = useMemo(() => {
    const palette = [
      '#f0dcaa', // Champagne gold
      '#e58aa6', // Rose ash
      '#c9a26a', // Amber antique gold
      '#f4eadc', // Ethereal stardust
      '#d97793', // Velvet blush
    ];

    const list: Particle[] = [];
    // 28 particles distributed across the screen
    for (let i = 0; i < 28; i++) {
      const size = Math.random() < 0.65 ? Math.random() * 2.5 + 2 : Math.random() * 3 + 3.5;
      const left = `${(i * 3.5 + Math.random() * 3.5).toFixed(1)}%`;
      const duration = Math.random() * 12 + 14; // 14s to 26s slow mysterious drift
      const delay = -(Math.random() * 20); // Negative delay so screen is immediately filled
      const driftX = (Math.random() - 0.5) * 50; // -25px to +25px sway
      const color = palette[i % palette.length];
      const opacity = Math.random() * 0.35 + 0.25;

      list.push({
        id: i,
        left,
        size,
        duration,
        delay,
        driftX,
        color,
        opacity,
      });
    }
    return list;
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {particles.map((p) => {
        const effectiveOpacity = extraDark ? p.opacity * 0.65 : p.opacity;
        return (
          <span
            key={p.id}
            className="melancholy-particle absolute rounded-full"
            style={
              {
                left: p.left,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                '--drift-x': `${p.driftX}px`,
                '--particle-opacity': effectiveOpacity,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
};
