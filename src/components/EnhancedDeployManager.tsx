import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Rocket, 
  Zap, 
  Shield, 
  Settings, 
  Play, 
  Square, 
  Info,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import DeployStatusModal from "./DeployStatusModal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DeployOption {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  endpoint: string;
  tooltip: string;
}

export default function EnhancedDeployManager() {
  const [activeDeployment, setActiveDeployment] = useState<string | null>(null);
  const [deployStatus, setDeployStatus] = useState<'idle' | 'building' | 'success' | 'error'>('idle');
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const { toast } = useToast();

  const deployOptions: DeployOption[] = [
    {
      id: 'quick',
      title: 'Быстрый деплой',
      description: 'Упрощенная сборка для тестирования',
      icon: Zap,
      color: 'bg-blue-600',
      endpoint: '/api/vercel/api-deploy',
      tooltip: 'Быстрая сборка без оптимизации. Подходит для тестирования изменений. Время: ~2-3 минуты.'
    },
    {
      id: 'production',
      title: 'Продакшн деплой',
      description: 'Полная оптимизация для релиза',
      icon: Rocket,
      color: 'bg-green-600',
      endpoint: '/api/vercel/deploy-production',
      tooltip: 'Полная сборка с минификацией и оптимизацией. Рекомендуется для релизов. Время: ~5-7 минут.'
    },
    {
      id: 'enhanced',
      title: 'Усиленный деплой',
      description: 'С исправлением ошибок esbuild',
      icon: Shield,
      color: 'bg-purple-600',
      endpoint: '/api/vercel/deploy-enhanced',
      tooltip: 'Деплой с исправлением конфигурации esbuild и максимальной совместимостью. Время: ~4-6 минут.'
    },
    {
      id: 'modular',
      title: 'Модульный деплой',
      description: 'Независимые части приложения',
      icon: Settings,
      color: 'bg-orange-600',
      endpoint: '/api/vercel/deploy-modular',
      tooltip: 'Разбивка приложения на модули для повышения надежности. Подходит для больших проектов. Время: ~6-8 минут.'
    }
  ];

  const handleDeploy = async (option: DeployOption) => {
    if (activeDeployment) {
      toast({
        title: "Деплой уже выполняется",
        description: "Дождитесь завершения текущего деплоя",
        variant: "destructive"
      });
      return;
    }

    setActiveDeployment(option.id);
    setDeployStatus('building');
    setDeployProgress(0);
    setDeployLogs([`Запуск ${option.title}...`]);
    setShowStatusModal(true);

    try {
      // Симуляция прогресса
      const progressInterval = setInterval(() => {
        setDeployProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 1000);

      const response = await apiRequest("POST", option.endpoint, {});
      
      clearInterval(progressInterval);
      setDeployProgress(100);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDeployStatus('success');
          setDeployLogs(prev => [...prev, 'Деплой завершен успешно!']);
          
          // Автоматический AI анализ после деплоя
          setTimeout(() => {
            analyzeDeployment();
          }, 2000);
        } else {
          setDeployStatus('error');
          setDeployLogs(prev => [...prev, `Ошибка: ${result.error}`]);
        }
      } else {
        setDeployStatus('error');
        setDeployLogs(prev => [...prev, 'Ошибка сети при деплое']);
      }
    } catch (error: any) {
      setDeployStatus('error');
      setDeployLogs(prev => [...prev, `Критическая ошибка: ${error.message}`]);
    } finally {
      setActiveDeployment(null);
    }
  };

  const analyzeDeployment = async () => {
    try {
      const response = await apiRequest("POST", "/api/ai/analyze-deployment", {
        logs: deployLogs
      });

      if (response.ok) {
        const analysis = await response.json();
        if (analysis.success && analysis.analysis.errors_detected > 0) {
          setDeployLogs(prev => [
            ...prev,
            '🤖 AI обнаружил ошибки:',
            ...analysis.analysis.recommendations
          ]);
        }
      }
    } catch (error) {
      console.log('AI анализ недоступен');
    }
  };

  const handleStopDeployment = () => {
    if (activeDeployment) {
      setActiveDeployment(null);
      setDeployStatus('error');
      setDeployLogs(prev => [...prev, 'Деплой остановлен пользователем']);
      toast({
        title: "Деплой остановлен",
        description: "Процесс деплоя был прерван",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = () => {
    switch (deployStatus) {
      case 'building':
        return <Clock className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <TooltipProvider>
      <Card className="w-full bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                Deploy Manager
              </CardTitle>
              <CardDescription className="text-gray-400">
                Управление деплоем приложения с AI-анализом ошибок
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <Badge variant={deployStatus === 'success' ? 'default' : deployStatus === 'error' ? 'destructive' : 'secondary'}>
                {deployStatus === 'idle' ? 'Готов' : 
                 deployStatus === 'building' ? 'Выполняется' :
                 deployStatus === 'success' ? 'Успешно' : 'Ошибка'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {deployStatus === 'building' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Прогресс деплоя</span>
                <span className="text-gray-400">{Math.round(deployProgress)}%</span>
              </div>
              <Progress value={deployProgress} className="w-full" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {deployOptions.map((option) => {
              const Icon = option.icon;
              const isActive = activeDeployment === option.id;
              
              return (
                <Tooltip key={option.id}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleDeploy(option)}
                      disabled={!!activeDeployment && !isActive}
                      className={`
                        h-auto p-4 flex flex-col items-start gap-2 text-left
                        ${isActive ? 'bg-blue-700 border-blue-500' : 'bg-gray-800 hover:bg-gray-700'}
                        border border-gray-600 transition-all duration-200
                      `}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className={`p-2 rounded ${option.color}`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-white text-sm">
                            {option.title}
                          </div>
                          <div className="text-xs text-gray-400">
                            {option.description}
                          </div>
                        </div>
                        {isActive && <Play className="w-4 h-4 text-blue-400" />}
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-sm">{option.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          <Separator className="bg-gray-700" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowStatusModal(true)}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Info className="w-3 h-3 mr-1" />
                Показать статус
              </Button>
              
              {activeDeployment && (
                <Button
                  onClick={handleStopDeployment}
                  variant="destructive"
                  size="sm"
                  className="text-xs"
                >
                  <Square className="w-3 h-3 mr-1" />
                  Остановить
                </Button>
              )}
            </div>
            
            <div className="text-xs text-gray-500">
              AI-анализ включен
            </div>
          </div>
        </CardContent>
      </Card>

      <DeployStatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        deploymentType={activeDeployment || 'unknown'}
        status={deployStatus}
        progress={deployProgress}
        logs={deployLogs}
        onCancel={activeDeployment ? handleStopDeployment : undefined}
      />
    </TooltipProvider>
  );
}