import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface LevelUpCelebrationProps {
  level: number | null;
  bonus: number;
  newClickValue: number;
  onComplete: () => void;
  playerLevel?: number;
}

export function LevelUpCelebration({ level, bonus, newClickValue, onComplete, playerLevel = 1 }: LevelUpCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (level) {
      setIsVisible(true);
      
      // Определяем нужно ли показывать полные эффекты
      const isNewPlayer = (playerLevel || 1) === 1;
      const showFullEffects = !isNewPlayer;
      
      console.log(`🎊 LevelUp для игрока уровня ${playerLevel}: ${showFullEffects ? 'полные эффекты' : 'упрощенный режим'}`);
      
      // Конфетти только для опытных игроков (уровень 2+)
      if (showFullEffects) {
        // Центральный взрыв
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#8B5CF6', '#06B6D4']
        });

        // Боковые фейерверки
        setTimeout(() => {
          confetti({
            particleCount: 20,
            angle: 60,
            spread: 45,
            origin: { x: 0, y: 0.8 },
            colors: ['#FFD700', '#FFA500', '#FF6347', '#8B5CF6', '#06B6D4']
          });
          
          confetti({
            particleCount: 20,
            angle: 120,
            spread: 45,
            origin: { x: 1, y: 0.8 },
            colors: ['#FFD700', '#FFA500', '#FF6347', '#8B5CF6', '#06B6D4']
          });
        }, 150);
      }

      // Автоматическое закрытие через 1.5 секунды
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 0); // Мгновенно после исчезновения
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [level, onComplete]);

  if (!level) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }} // Быстрое исчезновение
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => {
            setIsVisible(false);
            setTimeout(onComplete, 500);
          }}
        >
          <motion.div
            initial={{ scale: 0.3, rotateY: -180, y: 100 }}
            animate={{ scale: 1, rotateY: 0, y: 0 }}
            exit={{ scale: 0.3, rotateY: 180, y: -100 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              duration: 0.18 // Быстрое исчезновение
            }}
            className="bg-gradient-to-br from-yellow-600 via-orange-600 to-red-600 rounded-2xl border-4 border-yellow-400 p-8 max-w-lg mx-4 text-center relative overflow-hidden shadow-2xl"
          >
            {/* Блики и эффекты */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 blur-2xl"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
            
            {/* Содержимое */}
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0, rotate: -360 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="text-8xl mb-4"
              >
                🎉
              </motion.div>
              
              <motion.h2
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold text-white mb-2 drop-shadow-lg"
              >
                LEVEL UP!
              </motion.h2>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 400 }}
                className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center text-4xl font-bold text-black border-4 border-white shadow-xl"
              >
                {level}
              </motion.div>
              
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="space-y-3"
              >
                <div className="bg-black/30 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-yellow-200 text-lg font-bold mb-2">
                    Rewards Unlocked:
                  </div>
                  <div className="text-white text-xl font-bold">
                    +${bonus.toLocaleString()} Bonus
                  </div>
                  <div className="text-white text-lg">
                    Click Value: ${newClickValue.toFixed(1)}
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="mt-4 text-yellow-200 text-sm"
              >
                Keep growing your empire!
              </motion.div>
            </div>
            
            {/* Анимированные звезды */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: Math.random() * 500, 
                    y: 500, 
                    opacity: 1,
                    scale: Math.random() * 0.8 + 0.2,
                    rotate: 0
                  }}
                  animate={{ 
                    y: -100, 
                    opacity: 0,
                    rotate: 360,
                    scale: 0
                  }}
                  transition={{ 
                    duration: 1.5, // ограничить до 1.5 сек
                    delay: Math.random() * 0.5,
                    ease: "easeOut",
                    repeat: 0 // не повторять
                  }}
                  className="absolute text-yellow-300"
                >
                  ⭐
                </motion.div>
              ))}
            </div>

            {/* Пульсирующая граница */}
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-2xl border-4 border-yellow-300 opacity-60"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}