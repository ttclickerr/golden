import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface GameClockProps {
  className?: string;
  isCompact?: boolean;
}

export function GameClock({ className = "", isCompact = false }: GameClockProps) {
  const [gameTime, setGameTime] = useState(new Date());

  useEffect(() => {
    // Игровые часы идут в 60 раз быстрее реального времени
    // 1 реальная секунда = 1 игровая минута
    const interval = setInterval(() => {
      setGameTime(prev => new Date(prev.getTime() + 60000)); // +1 игровая минута каждую секунду
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatGameTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate();
    const month = date.toLocaleDateString('en', { month: 'short' });
    
    if (isCompact) {
      return `${hours}:${minutes}`;
    }
    return `${day} ${month} ${hours}:${minutes}`;
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Clock className={`text-blue-400 ${isCompact ? 'w-3 h-3' : 'w-4 h-4'}`} />
      <span className={`font-mono ${isCompact ? 'text-xs' : 'text-sm'} text-blue-400`}>
        {formatGameTime(gameTime)}
      </span>
    </div>
  );
}