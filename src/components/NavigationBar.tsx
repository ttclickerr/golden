import { useTranslation } from "@/lib/i18n";
import { HomeIcon, TrendingUpIcon, BuildingIcon, DicesIcon, BriefcaseIcon } from "lucide-react";

interface NavigationBarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isPremium?: boolean;
}

export function NavigationBar({ activeSection, onSectionChange, isPremium = false }: NavigationBarProps) {
  const { t } = useTranslation();
  
  const sections = [
    { id: 'home', name: t('home'), icon: HomeIcon, color: 'from-emerald-500 to-green-600' },
    { id: 'trading', name: t('trading'), icon: TrendingUpIcon, color: 'from-blue-500 to-purple-600' },
    { id: 'business', name: t('business'), icon: BuildingIcon, color: 'from-orange-500 to-yellow-600' },
    { id: 'casino', name: t('casino'), icon: DicesIcon, color: 'from-red-500 to-pink-600' },
    { id: 'portfolio', name: t('portfolio'), icon: BriefcaseIcon, color: 'from-slate-500 to-gray-600' }
  ];

  return (
    <nav className="absolute inset-x-0 bottom-[60px] backdrop-blur-xl bg-gradient-to-t from-slate-900/95 to-slate-800/90 border-t border-slate-700/50 py-2"> 
      <div className="container mx-auto max-w-lg">
        <div className="flex items-center justify-between px-4">
          {sections.map((section) => {
            const IconComponent = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 relative ${
                  isActive 
                    ? 'transform scale-105' 
                    : 'hover:bg-white/5'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-1 transition-all duration-300 relative ${
                  isActive 
                    ? 'bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/50 shadow-lg shadow-amber-500/20' 
                    : 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/30 hover:border-slate-600/50'
                }`}>
                  <IconComponent className={`w-5 h-5 transition-all duration-300 ${
                    isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-300'
                  }`} />
                  {isActive && (
                    <div className="absolute inset-0 rounded-lg bg-amber-500/10 animate-pulse"></div>
                  )}
                </div>
                <span className={`text-[10px] font-medium transition-all duration-300 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-white/70'
                }`}>
                  {section.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
