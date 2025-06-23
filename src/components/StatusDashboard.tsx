import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Activity,
  Server,
  Database,
  Globe
} from 'lucide-react';

interface SystemStatus {
  overall: string;
  backend: { status: string; latency: number; };
  database: { status: string; latency: number; error?: string; };
  external_apis: { firebase: string; admob: string; vercel: string; };
}

interface DeploymentStatus {
  uid?: string;
  state?: string;
  status?: string;
  url?: string;
  errorMessage?: string;
}

interface StatusDashboardProps {
  systemStatus: SystemStatus;
  deploymentStatus: DeploymentStatus;
  view?: 'compact' | 'detailed';
  autoExpand?: 'onError' | 'always' | 'never';
}

export default function StatusDashboard({ 
  systemStatus, 
  deploymentStatus, 
  view = 'compact',
  autoExpand = 'onError' 
}: StatusDashboardProps) {
  const [isExpanded, setIsExpanded] = useState(
    autoExpand === 'always' || 
    (autoExpand === 'onError' && (systemStatus?.overall !== 'healthy' || deploymentStatus?.state === 'ERROR'))
  );

  const getOverallStatus = () => {
    const hasDeploymentError = deploymentStatus?.state === 'ERROR' || deploymentStatus?.status === 'error';
    const hasSystemError = systemStatus?.overall !== 'healthy';
    
    if (hasDeploymentError || hasSystemError) return 'error';
    if (deploymentStatus?.state === 'BUILDING' || deploymentStatus?.status === 'building') return 'building';
    return 'healthy';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'building':
        return <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />;
      case 'error':
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success':
        return 'text-green-400 bg-green-400/10';
      case 'building':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'error':
      case 'failed':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <Card className="bg-white/5 border border-purple-400/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            {getStatusIcon(overallStatus)}
            System Status
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${getStatusColor(overallStatus)}`}>
              {overallStatus === 'healthy' ? 'All Systems Operational' : 
               overallStatus === 'building' ? 'Deployment in Progress' : 
               'Issues Detected'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Critical Issues Alert */}
        {(deploymentStatus?.errorMessage || systemStatus?.database?.error) && (
          <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 font-medium text-sm">Critical Issues</span>
            </div>
            {deploymentStatus?.errorMessage && (
              <div className="text-red-200 text-xs mb-1">
                Deploy: {deploymentStatus.errorMessage}
              </div>
            )}
            {systemStatus?.database?.error && (
              <div className="text-red-200 text-xs">
                Database: {systemStatus.database.error}
              </div>
            )}
          </div>
        )}

        {/* Quick Status Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Deployment</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(deploymentStatus?.state === 'ERROR' ? 'error' : 
                            deploymentStatus?.state === 'BUILDING' ? 'building' : 'healthy')}
              <span className="text-xs text-white">
                {deploymentStatus?.state || 'Unknown'}
              </span>
            </div>
          </div>
          
          <div className="bg-black/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Backend</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(systemStatus?.backend?.status || 'unknown')}
              <span className="text-xs text-white">
                {systemStatus?.backend?.latency ? `${systemStatus.backend.latency}ms` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Status */}
        {isExpanded && (
          <div className="space-y-3">
            {/* System Components */}
            <div className="bg-black/20 rounded-lg p-3">
              <h4 className="text-sm font-medium text-white mb-2">System Components</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-3 h-3 text-blue-400" />
                    <span className="text-xs text-gray-300">Database</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus?.database?.status || 'unknown')}
                    <span className="text-xs text-white">
                      {systemStatus?.database?.latency ? `${systemStatus.database.latency}ms` : 'N/A'}
                    </span>
                  </div>
                </div>
                
                {/* External APIs */}
                {systemStatus?.external_apis && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-300">Firebase</span>
                      {getStatusIcon(systemStatus.external_apis.firebase)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-300">AdMob</span>
                      {getStatusIcon(systemStatus.external_apis.admob)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-300">Vercel</span>
                      {getStatusIcon(systemStatus.external_apis.vercel)}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Deployment Details */}
            {deploymentStatus?.uid && (
              <div className="bg-black/20 rounded-lg p-3">
                <h4 className="text-sm font-medium text-white mb-2">Current Deployment</h4>
                <div className="space-y-1 text-xs">
                  <div className="text-gray-300">ID: <span className="font-mono">{deploymentStatus.uid}</span></div>
                  {deploymentStatus.url && (
                    <div className="text-blue-300 break-all">{deploymentStatus.url}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}