import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Rocket, ChevronDown, Zap, Settings, Wrench } from 'lucide-react';

interface DeployManagerProps {
  onDeploy: (type: 'quick' | 'production' | 'fix') => void;
  onModularDeploy?: (modules?: string[]) => void;
  onEnhancedDeploy?: () => void;
  isLoading: boolean;
  status: 'ready' | 'building' | 'error' | 'success';
  lastDeployment?: {
    url?: string;
    timestamp?: string;
    status?: string;
  };
}

export default function DeployManager({ onDeploy, onModularDeploy, onEnhancedDeploy, isLoading, status, lastDeployment }: DeployManagerProps) {
  const [deployType, setDeployType] = useState<'quick' | 'production' | 'fix'>('production');

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'text-green-400 bg-green-400/10';
      case 'building': return 'text-yellow-400 bg-yellow-400/10';
      case 'error': return 'text-red-400 bg-red-400/10';
      default: return 'text-blue-400 bg-blue-400/10';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'success': return 'Deployed';
      case 'building': return 'Building...';
      case 'error': return 'Failed';
      default: return 'Ready';
    }
  };

  const handleDeploy = () => {
    onDeploy(deployType);
  };

  const getDeployButtonText = () => {
    if (isLoading) return 'Deploying...';
    if (status === 'error') return 'Retry Deploy';
    return 'AI Deploy';
  };

  return (
    <div className="bg-white/5 border border-purple-400/20 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Rocket className="w-5 h-5 text-purple-400" />
          Deployment Manager
        </h3>
        <Badge className={`text-xs ${getStatusColor()}`}>
          {getStatusText()}
        </Badge>
      </div>

      {/* Last Deployment Info */}
      {lastDeployment && (
        <div className="bg-black/20 rounded p-3 text-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Last Deployment</span>
            <Badge variant={lastDeployment.status === 'ERROR' ? 'destructive' : 'secondary'} className="text-xs">
              {lastDeployment.status}
            </Badge>
          </div>
          {lastDeployment.url && (
            <div className="text-blue-300 font-mono text-xs mb-1">
              {lastDeployment.url}
            </div>
          )}
          {lastDeployment.timestamp && (
            <div className="text-gray-500 text-xs">
              {new Date(lastDeployment.timestamp).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* Deploy Controls */}
      <div className="flex gap-2">
        {/* Main Deploy Button */}
        <Button
          onClick={handleDeploy}
          disabled={isLoading}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Deploying...
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4 mr-2" />
              {getDeployButtonText()}
            </>
          )}
        </Button>

        {/* Deploy Type Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="border-purple-400/40">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-900/95 border-gray-700">
            <DropdownMenuItem 
              onClick={() => setDeployType('quick')}
              className="text-white hover:bg-gray-800"
            >
              <Zap className="w-4 h-4 mr-2 text-blue-400" />
              Quick Deploy
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setDeployType('production')}
              className="text-white hover:bg-gray-800"
            >
              <Rocket className="w-4 h-4 mr-2 text-purple-400" />
              Production Deploy
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setDeployType('fix')}
              className="text-white hover:bg-gray-800"
            >
              <Wrench className="w-4 h-4 mr-2 text-orange-400" />
              Fix & Deploy
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Deploy Type Info */}
      <div className="text-xs text-gray-400">
        {deployType === 'quick' && '→ Fast deployment with minimal checks'}
        {deployType === 'production' && '→ Full production build with AI optimization'}
        {deployType === 'fix' && '→ Analyze errors and deploy with fixes'}
      </div>

      {/* Modular Deploy Section */}
      {onModularDeploy && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Modular Deploy (по частям)
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => onModularDeploy(['client-core', 'client-components', 'client-pages'])}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="text-xs border-purple-400/40 text-purple-300 hover:bg-purple-600/20"
            >
              📦 Client Only
            </Button>
            <Button
              onClick={() => onModularDeploy(['server-api', 'shared-types'])}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="text-xs border-indigo-400/40 text-indigo-300 hover:bg-indigo-600/20"
            >
              🔌 API Only
            </Button>
            <Button
              onClick={() => onModularDeploy()}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="text-xs border-pink-400/40 text-pink-300 hover:bg-pink-600/20"
            >
              🎯 Full Modular
            </Button>
            <Button
              onClick={() => onEnhancedDeploy?.()}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="text-xs border-green-400/40 text-green-300 hover:bg-green-600/20"
            >
              ⚡ Enhanced
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Развертывание отдельных модулей для оптимизации скорости
          </div>
        </div>
      )}
    </div>
  );
}