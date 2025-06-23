import { useTranslation } from 'react-i18next';
import { useSettings } from '../../lib/stores/useSettings';
import { useAudio } from '../../lib/stores/useAudio';
import { Button } from '../ui/button';
import { SettingsModal } from '../SettingsModalNew';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from '../ui/navigation-menu';
import { useState, useMemo } from 'react';
import { Badge } from '../ui/badge';
import { Zap, Sun, Moon, Settings, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { useGameState, INITIAL_STATE } from '../../hooks/useGameState';

const Header = () => {
  const { t } = useTranslation();
  const { darkMode, toggleDarkMode } = useSettings();
  const { setGameState } = useGameState();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { gameState } = useGameState();
  
  // Получаем количество доступных бустеров (пример: считаем неактивные бустеры)
  const allBoosters = ['mega_multiplier', 'golden_touch', 'time_warp', 'booster_reset'];
  const now = Date.now();
  const availableBoosters = allBoosters.filter(
    (id) => !gameState.activeBoosters[id] || gameState.activeBoosters[id].endTime < now
  );
  const boostersCount = availableBoosters.length;

  const confirmReset = () => {
    if (window.confirm(t('settings.confirmReset'))) {
      setGameState({ ...INITIAL_STATE });
      // Можно добавить уведомление через alert или кастомную систему, если нужно
      alert(t('settings.resetSuccess'));
    }
  };

  return (
    <header className="border-b border-[#4cc3a5]/30 bg-[rgba(0,0,0,0.3)] header-with-padding">
      <div className="w-full flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="font-bold text-xl text-white">{t('app.title')}</div>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink className="text-white hover:text-[#4cc3a5]" href="#">
                  {t('nav.buildings')}
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="text-white hover:text-[#4cc3a5]" href="#">
                  {t('nav.upgrades')}
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="text-white hover:text-[#4cc3a5]" href="#">
                  {t('nav.stats')}
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Кнопка истории транзакций с бейджем бустеров */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-[rgba(76,195,165,0.2)] text-white"
              title="Boosters"
            >
              <Zap className="h-5 w-5" />
            </Button>
            {boostersCount > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-yellow-500 text-white border-0 px-1.5 py-0.5 text-xs">
                {boostersCount}
              </Badge>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="hover:bg-[rgba(76,195,165,0.2)] text-white"
            title={darkMode ? t('settings.lightMode') : t('settings.darkMode')}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={confirmReset}
            className="hover:bg-[rgba(76,195,165,0.2)] text-white"
            title={t('settings.resetGame')}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
          
          {/* Кнопка настроек с бейджем бустеров (если нужно) */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              className="hover:bg-[rgba(76,195,165,0.2)] text-white"
              title={t('settings.title')}
            >
              <Settings className="h-5 w-5" />
            </Button>
            {boostersCount > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-yellow-500 text-white border-0 px-1.5 py-0.5 text-xs">
                {boostersCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
};

export default Header;
