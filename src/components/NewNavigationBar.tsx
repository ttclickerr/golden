import { useTranslation } from "@/lib/i18n";
import { DollarSign as DollarSignIcon, TrendingUpIcon, BuildingIcon, DicesIcon, BriefcaseIcon, CrownIcon } from "lucide-react";

interface NewNavigationBarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isPremium?: boolean;
  className?: string;
}

const NAV_HEIGHT = 70; // px
const BANNER_HEIGHT = 60; // px

export function NewNavigationBar({ activeSection, onSectionChange, isPremium = false, className = "" }: NewNavigationBarProps) {
  const { t } = useTranslation();
  const sections = [
    { id: 'home', name: 'Money', icon: DollarSignIcon },
    { id: 'trading', name: t('trading'), icon: TrendingUpIcon },
    { id: 'business', name: t('business'), icon: BuildingIcon },
    { id: 'casino', name: t('casino'), icon: DicesIcon },
    { id: 'portfolio', name: t('portfolio'), icon: BriefcaseIcon }
  ];
  // Навигация всегда над баннером
  const bottomOffset = isPremium ? 0 : BANNER_HEIGHT;

  return (
    <nav
      className={`fixed left-0 right-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-slate-600/50 backdrop-blur-lg ${className}`}
      style={{
        bottom: `${bottomOffset}px`,
        height: `${NAV_HEIGHT}px`,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
        transition: 'bottom 0.2s',
      }}
      aria-label="Основная навигация"
    >
      <div className="max-w-lg mx-auto h-full">
        <div className="flex items-center justify-between px-4 h-full">
          {sections.map((section) => {
            const IconComponent = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[60px] ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
                aria-label={section.name}
                tabIndex={0}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 transition-colors ${isActive ? 'border-2 border-yellow-400 shadow-lg shadow-yellow-500/30 bg-blue-500/20 text-blue-400' : 'text-slate-400'} `}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className={`text-xs font-medium transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400'}`}>{section.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      {/* Премиум-индикатор */}
      {isPremium && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-300 px-3 py-1 rounded-full shadow text-xs font-bold text-gray-900 flex items-center gap-1">
          <CrownIcon className="w-4 h-4 text-yellow-700" /> PREMIUM
        </div>
      )}
    </nav>
  );
}
