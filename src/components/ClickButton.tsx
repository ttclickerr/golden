import { useState, useEffect } from "react";

interface ClickButtonProps {
  onClick: () => void;
  clickValue: number;
}



export function ClickButton({ onClick, clickValue }: ClickButtonProps) {
  const [floatingTexts, setFloatingTexts] = useState<Array<{ id: number; value: number; x: number; y: number }>>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);



  const handleClick = () => {
    onClick();
    
    // Виброотдача для мобильных устройств
    import('@/lib/vibration').then(({ vibrationService }) => {
      vibrationService.vibrateClick();
    });
    
    // Активируем анимацию клика
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 150);
    
    // Create floating money effect with random position
    const id = Date.now();
    const x = Math.random() * 100 - 50; // Random X offset
    const y = Math.random() * 50 + 20;  // Random Y offset upward
    
    setFloatingTexts(prev => [...prev, { id, value: clickValue, x, y }]);
    
    // Remove floating text after animation
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(text => text.id !== id));
    }, 2500);
  };

  return (
    <div className="flex justify-center relative">
      {/* Область клика точно по размеру кнопки */}
      <div 
        className="absolute w-32 h-32 rounded-full z-30 cursor-pointer"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={`Кликни, чтобы заработать $${clickValue}`}
      ></div>
      
      {/* Orbiting spherical rings */}
      <div className="absolute w-48 h-48 flex items-center justify-center pointer-events-none">
        {/* Ring 1 - Outer clockwise */}
        <div className="absolute w-48 h-48 rounded-full border-2 border-teal-400/30 animate-spin-slow">
          <div className="absolute w-3 h-3 bg-teal-400 rounded-full -top-1.5 left-1/2 transform -translate-x-1/2 shadow-glow-teal"></div>
        </div>
        
        {/* Ring 2 - Middle counter-clockwise */}
        <div className="absolute w-40 h-40 rounded-full border-2 border-indigo-400/30 animate-spin-reverse-slow">
          <div className="absolute w-3 h-3 bg-indigo-400 rounded-full -top-1.5 left-1/2 transform -translate-x-1/2 shadow-glow-indigo"></div>
        </div>
        
        {/* Ring 3 - Inner diagonal rotation */}
        <div className="absolute w-36 h-36 rounded-full border-2 border-purple-400/30 animate-spin-diagonal-slow">
          <div className="absolute w-3 h-3 bg-purple-400 rounded-full -top-1.5 left-1/2 transform -translate-x-1/2 shadow-glow-purple"></div>
        </div>
        
        {/* Ring 4 - Outer diagonal counter rotation */}
        <div className="absolute w-44 h-44 rounded-full border-2 border-cyan-400/30 animate-spin-diagonal-reverse-slow rotate-45">
          <div className="absolute w-3 h-3 bg-cyan-400 rounded-full -top-1.5 left-1/2 transform -translate-x-1/2 shadow-glow-cyan"></div>
        </div>
      </div>



      {/* Main button with premium effects */}
      <button 
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          premium-button w-32 h-32 rounded-full transform transition-all duration-150 
          flex items-center justify-center group overflow-hidden z-10 premium-glow
          ${isClicking ? 'scale-125 rotate-3 shadow-2xl shadow-emerald-500/50' : 
            isHovered ? 'scale-110' : 'scale-100'}
          bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600
          hover:from-emerald-300 hover:via-teal-400 hover:to-cyan-500
          border-4 border-white/30
          ${isClicking ? 'bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500 brightness-125' : ''}
        `}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px',
          ...(isClicking && {
            transform: 'scale(1.25) rotateX(-10deg) rotateY(5deg) translateZ(20px)',
            boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.5), 0 0 0 8px rgba(255, 255, 255, 0.1)'
          })
        }}
      >
        {/* Premium gradient border */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 p-[2px]">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600"></div>
        </div>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent 
                      transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        
        {/* Inner premium glow */}
        <div className="absolute inset-3 rounded-full bg-white/20 blur-md"></div>
        
        {/* Content */}
        <div className={`relative text-center text-white z-20 transition-all duration-150 ${
          isClicking ? 'transform scale-110' : ''
        }`}>
          <div className={`text-5xl font-bold mb-1 drop-shadow-lg transition-all duration-150 ${
            isClicking ? 'animate-pulse scale-125' : 'animate-bounce-gentle'
          }`}>👇</div>
          <div className={`text-lg font-bold drop-shadow-md transition-all duration-150 ${
            isClicking ? 'scale-110 text-yellow-200' : ''
          }`}>CLICK</div>
          <div className={`text-sm font-semibold mt-1 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-150 ${
            isClicking ? 'bg-yellow-500/40 border-yellow-300/40 scale-110' : ''
          }`}>
            +${clickValue.toFixed(1)}
          </div>
        </div>

        {/* Ударная волна при клике */}
        {isClicking && (
          <div className="absolute inset-0 rounded-full border-4 border-white/60 animate-ping-once"></div>
        )}

        {/* Premium ripple effects */}
        <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse"></div>
        <div className="absolute inset-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 animate-ping opacity-75"></div>
      </button>
      
      {/* Floating money effects */}
      {floatingTexts.map(({ id, value, x, y }) => (
        <div
          key={id}
          className="absolute pointer-events-none z-50 animate-float-up text-3xl font-bold text-emerald-400 drop-shadow-lg"
          style={{
            left: `calc(50% + ${x}px)`,
            top: `calc(50% - ${y}px)`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          +${value.toFixed(1)}
        </div>
      ))}

      {/* Particle effects */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-emerald-400 rounded-full animate-float-random opacity-60`}
            style={{
              left: `${20 + i * 10}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}
