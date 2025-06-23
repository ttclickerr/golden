import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ExternalLink, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Code,
  Server,
  Globe
} from 'lucide-react';

interface VercelDeployment {
  uid: string;
  name: string;
  url: string;
  state: string;
  readyState: string;
  createdAt: string;
  meta?: any;
}

interface VercelDashboardProps {
  className?: string;
}

export default function VercelDashboard({ className }: VercelDashboardProps) {
  const [selectedDeployment, setSelectedDeployment] = useState<string | null>(null);

  // Fetch all deployments
  const { data: deploymentsData, refetch: refetchDeployments, isLoading } = useQuery({
    queryKey: ['/api/vercel/deployments/all'],
    refetchInterval: 30000
  });

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ['/api/vercel/projects'],
    refetchInterval: 60000
  });

  // Fetch deployment logs for selected deployment
  const { data: logsData } = useQuery({
    queryKey: ['/api/vercel/deployment', selectedDeployment, 'logs'],
    enabled: !!selectedDeployment,
    refetchInterval: 10000
  });

  const deployments = deploymentsData?.deployments || [];
  const projects = projectsData?.projects || [];

  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'READY': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'ERROR': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'BUILDING': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'READY': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'ERROR': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'BUILDING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  if (!deploymentsData?.success && deploymentsData?.needsSetup) {
    return (
      <Card className={`bg-red-500/5 border-red-500/20 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            Vercel Token Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-300">
              To use full Vercel integration, you need to provide a Vercel API token.
            </p>
            <div className="bg-black/20 rounded p-3 text-sm font-mono">
              <div className="space-y-1 text-gray-300">
                <div>1. Go to https://vercel.com/account/tokens</div>
                <div>2. Create new token</div>
                <div>3. Add as VERCEL_TOKEN secret</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-400" />
          Vercel Dashboard
        </h2>
        <Button
          onClick={() => refetchDeployments()}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="deployments" className="space-y-4">
        <TabsList className="bg-black/20 border border-gray-700">
          <TabsTrigger value="deployments" className="data-[state=active]:bg-purple-600/20">
            Deployments
          </TabsTrigger>
          <TabsTrigger value="projects" className="data-[state=active]:bg-purple-600/20">
            Projects
          </TabsTrigger>
          {selectedDeployment && (
            <TabsTrigger value="logs" className="data-[state=active]:bg-purple-600/20">
              Logs & Details
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="deployments" className="space-y-4">
          <Card className="bg-white/5 border border-purple-400/20">
            <CardHeader>
              <CardTitle className="text-sm text-gray-300">Recent Deployments</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {deployments.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No deployments found
                    </div>
                  ) : (
                    deployments.map((deployment: VercelDeployment) => (
                      <div
                        key={deployment.uid}
                        className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/40 cursor-pointer transition-colors"
                        onClick={() => setSelectedDeployment(deployment.uid)}
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(deployment.readyState)}
                          <div>
                            <div className="font-medium text-sm text-white">
                              {deployment.name || 'Unnamed'}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(deployment.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getStatusColor(deployment.readyState)}`}>
                            {deployment.readyState}
                          </Badge>
                          {deployment.url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://${deployment.url}`, '_blank');
                              }}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card className="bg-white/5 border border-purple-400/20">
            <CardHeader>
              <CardTitle className="text-sm text-gray-300">Vercel Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {projects.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No projects found
                    </div>
                  ) : (
                    projects.map((project: any) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-black/20"
                      >
                        <div className="flex items-center gap-3">
                          <Server className="w-4 h-4 text-blue-400" />
                          <div>
                            <div className="font-medium text-sm text-white">
                              {project.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              Framework: {project.framework || 'Unknown'}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {project.targets?.production?.domain || 'No domain'}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {selectedDeployment && logsData && (
          <TabsContent value="logs" className="space-y-4">
            <Card className="bg-white/5 border border-purple-400/20">
              <CardHeader>
                <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Deployment Details & Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Deployment Info */}
                  <div className="grid grid-cols-2 gap-4 p-3 bg-black/20 rounded-lg">
                    <div>
                      <div className="text-xs text-gray-400">Status</div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(logsData.deployment?.readyState)}
                        <span className="text-sm text-white">
                          {logsData.deployment?.readyState}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">URL</div>
                      <div className="text-sm text-blue-300 font-mono">
                        {logsData.deployment?.url || 'Not available'}
                      </div>
                    </div>
                  </div>

                  {/* Build Logs */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Build Logs</h4>
                    <ScrollArea className="h-48 bg-black/40 rounded p-3">
                      <div className="font-mono text-xs space-y-1">
                        {logsData.buildLogs?.length === 0 ? (
                          <div className="text-gray-400">No build logs available</div>
                        ) : (
                          logsData.buildLogs?.map((log: any, index: number) => (
                            <div key={index} className="text-gray-300">
                              <span className="text-gray-500">
                                {new Date(log.created).toLocaleTimeString()}
                              </span>
                              {' '}
                              {log.text}
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Error Logs */}
                  {logsData.errorLogs?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-red-400 mb-2">Error Logs</h4>
                      <ScrollArea className="h-32 bg-red-500/5 border border-red-500/20 rounded p-3">
                        <div className="font-mono text-xs space-y-1">
                          {logsData.errorLogs.map((log: any, index: number) => (
                            <div key={index} className="text-red-300">
                              <span className="text-red-500">
                                {new Date(log.created).toLocaleTimeString()}
                              </span>
                              {' '}
                              {log.text}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}