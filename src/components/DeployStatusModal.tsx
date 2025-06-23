import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info, X, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface DeployStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  deploymentType: string;
  status: 'idle' | 'building' | 'success' | 'error';
  progress: number;
  logs: string[];
  onCancel?: () => void;
}

export default function DeployStatusModal({
  isOpen,
  onClose,
  deploymentType,
  status,
  progress,
  logs,
  onCancel
}: DeployStatusModalProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'building':
        return <Clock className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default:
        return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'building':
        return 'Выполняется деплой...';
      case 'success':
        return 'Деплой завершен успешно';
      case 'error':
        return 'Ошибка деплоя';
      default:
        return 'Готов к деплою';
    }
  };

  const getDeploymentDescription = () => {
    switch (deploymentType) {
      case 'quick':
        return 'Быстрый деплой использует упрощенную сборку для максимальной скорости. Подходит для тестирования изменений.';
      case 'production':
        return 'Продакшн деплой включает полную оптимизацию, минификацию и все проверки качества. Рекомендуется для релизов.';
      case 'modular':
        return 'Модульный деплой разбивает приложение на части и деплоит их независимо для повышения надежности.';
      case 'enhanced':
        return 'Усиленный деплой с исправлением ошибок esbuild и максимальной совместимостью с Vercel.';
      default:
        return 'Стандартный процесс деплоя приложения на Vercel.';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            {getStatusIcon()}
            Статус деплоя - {deploymentType}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Status and Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">{getStatusText()}</span>
              <Badge 
                variant={status === 'success' ? 'default' : status === 'error' ? 'destructive' : 'secondary'}
                className={status === 'building' ? 'bg-blue-600' : ''}
              >
                {status.toUpperCase()}
              </Badge>
            </div>
            {status === 'building' && (
              <Progress value={progress} className="w-full" />
            )}
          </div>

          {/* Deployment Type Description */}
          <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
            <h4 className="text-sm font-medium text-white mb-2">Описание процесса:</h4>
            <p className="text-xs text-gray-300">{getDeploymentDescription()}</p>
          </div>

          {/* Logs */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white">Логи деплоя:</h4>
            <ScrollArea className="h-32 w-full rounded border border-gray-700 bg-gray-950">
              <div className="p-3 space-y-1">
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <div key={index} className="text-xs font-mono text-gray-300">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-500">Логи появятся здесь во время деплоя...</div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <div>
              {status === 'building' && onCancel && (
                <Button
                  onClick={onCancel}
                  variant="destructive"
                  size="sm"
                  className="text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Остановить деплой
                </Button>
              )}
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="text-xs border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Закрыть
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}