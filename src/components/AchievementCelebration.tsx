import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  reward: number;
  level: number;
}

interface AchievementCelebrationProps {
  achievement: Achievement | null;
  onComplete: () => void;
  playerLevel?: number;
}

export function AchievementCelebration({ achievement, onComplete, playerLevel = 1 }: AchievementCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      
      // Определяем нужно ли показывать полные эффекты
      const isNewPlayer = (playerLevel || 1) === 1;
      const showFullEffects = !isNewPlayer;
      
      console.log(`🎊 Achievement для игрока уровня ${playerLevel}: ${showFullEffects ? 'полные эффекты' : 'упрощенный режим'}`);
      
      // Конфетти только для опытных игроков (уровень 2+)
      if (showFullEffects) {
        // Запуск фейерверка
        const fireConfetti = () => {
          const duration = 1000; // 1 секунда
          const end = Date.now() + duration;

          const frame = () => {
            confetti({
              particleCount: 2,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B']
            });
            confetti({
              particleCount: 2,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B']
            });
            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          };
          frame();
        };
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B']
        });
        setTimeout(fireConfetti, 500);
      }
      // Автоматическое закрытие через 1.5 секунды
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 0); // Мгновенно после исчезновения
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [achievement, onComplete, playerLevel]);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }} // Быстрое исчезновение
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => {
            setIsVisible(false);
            setTimeout(onComplete, 500);
          }}
        >
          <motion.div
            initial={{ scale: 0.5, rotateY: -180 }}
            animate={{ scale: 1, rotateY: 0 }}
            exit={{ scale: 0.5, rotateY: 180 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              duration: 0.18 // Быстрое исчезновение
            }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-gradient-to-r from-purple-500 to-cyan-500 p-8 max-w-md mx-4 text-center relative overflow-hidden"
          >
            {/* Гlow эффект */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-xl"></div>
            
            {/* Содержимое */}
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2"
              >
                Achievement Unlocked!
              </motion.h2>
              
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-3xl"
              >
                <i className={achievement.icon}></i>
              </motion.div>
              
              <motion.h3
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xl font-bold text-white mb-2"
              >
                {achievement.name}
              </motion.h3>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-gray-300 mb-4"
              >
                {achievement.description}
              </motion.p>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-6 py-2 rounded-full font-bold"
              >
                +${achievement.reward.toLocaleString()} Reward
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-4 text-sm text-gray-400"
              >
                Level {achievement.level} Achievement
              </motion.div>
            </div>
            
            {/* Анимированные частицы */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: Math.random() * 400, 
                    y: 400, 
                    opacity: 1,
                    scale: Math.random() * 0.5 + 0.5
                  }}
                  animate={{ 
                    y: -100, 
                    opacity: 0,
                    rotate: 360
                  }}
                  transition={{ 
                    duration: 1.5, // ограничить до 1.5 сек
                    delay: Math.random() * 0.5,
                    repeat: 0 // не повторять
                  }}
                  className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}