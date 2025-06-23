import { useState, useEffect } from 'react';
import { useTransition, animated } from 'react-spring';
import { useGameState } from '@/lib/stores/useGameState';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DollarSign, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Generate random positions for the click animations
const getRandomPosition = () => ({
  x: Math.random() * 200 - 100,
  y: -100 - Math.random() * 50,
});

interface ClickAnimationProps {
  value: number;
}

const ClickAnimation = ({ value }: ClickAnimationProps) => {
  return (
    <animated.div
      className="absolute text-green-500 font-bold pointer-events-none z-10"
      style={{
        transform: 'translate(-50%, -50%)',
      }}
    >
      +{value}
    </animated.div>
  );
};

const ClickArea = () => {
  const { t } = useTranslation();
  const { click, clickValue, level, xp, xpRequired } = useGameState();
  const [animations, setAnimations] = useState<{ id: number; x: number; y: number; value: number }[]>([]);
  const [clickCount, setClickCount] = useState(0);
  
  // Clean up animations every few seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimations([]);
    }, 2000);
    
    return () => clearInterval(timer);
  }, []);
  
  const transitions = useTransition(animations, {
    from: item => ({
      opacity: 1,
      transform: `translate(${item.x}px, 0px)`,
    }),
    enter: item => ({
      opacity: 0,
      transform: `translate(${item.x}px, ${item.y}px)`,
    }),
    leave: { opacity: 0 },
    config: { tension: 120, friction: 14 },
    expires: 1000,
  });

  const handleClick = () => {
    click();
    
    // Add a new animation with a unique ID
    const pos = getRandomPosition();
    setAnimations(animations => [
      ...animations, 
      { id: Date.now(), x: pos.x, y: pos.y, value: clickValue }
    ]);
    
    // Increment click counter for animation purposes
    setClickCount(c => c + 1);
  };

  // Calculate XP progress percentage
  const xpProgress = (xp / xpRequired) * 100;

  return (
    <div className="relative mt-8 flex flex-col items-center justify-center">
      {/* Уровень и прогресс */}
      <div className="mb-4 w-full max-w-xs">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-sm font-semibold">{t('stats.level')}: {level}</span>
          </div>
          <div className="text-xs text-muted-foreground">{xp} / {xpRequired} XP</div>
        </div>
        <Progress value={xpProgress} className="h-2" />
      </div>
      
      <div 
        className="relative w-64 h-64 rounded-full flex items-center justify-center overflow-hidden"
      >
        {transitions((style, item) => (
          <animated.div 
            style={style} 
            className="absolute"
          >
            <ClickAnimation value={item.value} />
          </animated.div>
        ))}
        
        <button
          className={cn(
            "w-48 h-48 rounded-full text-xl font-bold text-white transition-all duration-100",
            "active:scale-95 active:shadow-inner active:bg-gradient-to-br active:from-[#355c56] active:to-[#2a3e5a]",
            "bg-gradient-to-br from-[#4cc3a5] to-[#3a81d6] shadow-lg hover:shadow-xl",
            "relative outline-none border-none overflow-hidden"
          )}
          onClick={handleClick}
        >
          <div className="absolute inset-2 rounded-full bg-[rgba(0,0,0,0.2)] flex items-center justify-center">
            <div className="text-center">
              <DollarSign className="h-10 w-10 mx-auto text-white mb-2" />
              <span className="text-xl font-bold">{t('game.click')}</span>
            </div>
          </div>
        </button>
      </div>
      
      <p className="mt-4 text-sm text-muted-foreground">
        {t('game.clickValue')}: <span className="font-semibold text-primary">{clickValue}</span>
      </p>
    </div>
  );
};

export default ClickArea;
