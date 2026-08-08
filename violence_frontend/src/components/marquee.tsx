import { ReactNode } from 'react';

interface MarqueeProps {
  children: ReactNode;
  speed?: 'slow' | 'normal' | 'fast';
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
}

export function Marquee({
  children,
  speed = 'normal',
  direction = 'left',
  pauseOnHover = true,
}: MarqueeProps) {
  const speedClass = {
    slow: 'animate-marquee-slow',
    normal: 'animate-marquee',
    fast: 'animate-marquee-fast',
  }[speed];

  const directionClass = direction === 'right' ? 'flex-row-reverse' : '';

  return (
    <div className="relative w-full overflow-hidden">
      <div className={`flex ${directionClass}`}>
        <div
          className={`flex gap-4 pr-4 ${speedClass} ${pauseOnHover ? 'hover:[animation-play-state:paused]' : ''}`}
        >
          {children}
        </div>
        <div
          className={`flex gap-4 pr-4 ${speedClass} ${pauseOnHover ? 'hover:[animation-play-state:paused]' : ''}`}
          aria-hidden="true"
        >
          {children}
        </div>
        <div
          className={`flex gap-4 pr-4 ${speedClass} ${pauseOnHover ? 'hover:[animation-play-state:paused]' : ''}`}
          aria-hidden="true"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
