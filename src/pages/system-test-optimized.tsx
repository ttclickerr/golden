import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Settings, BarChart3 } from "lucide-react";

// Import optimized components
import DeployManager from "@/components/DeployManager";
import AIAssistant from "@/components/AIAssistant";
import StatusDashboard from "@/components/StatusDashboard";
import VercelDashboard from "@/components/VercelDashboard";

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  model?: string;
  timestamp?: string;
}

export default function SystemTestOptimized() {
  const [selectedAiModel, setSelectedAiModel] = useState<string>('combined');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState<string>('');

  // Data queries
  const { data: systemData, refetch, isLoading } = useQuery({
    queryKey: ['/api/test/all'],
    refetchInterval: 30000,
  });

  const { data: vercelData, refetch: refetchVercel } = useQuery({
    queryKey: ['/api/vercel/deployment-status'],
    refetchInterval: 15000,
  });

  const { data: deploymentStats } = useQuery({
    queryKey: ['/api/deployment/stats'],
    refetchInterval: 60000
  });

  const { data: liveMetrics } = useQuery({
    queryKey: ['/api/deployment/live-metrics'],
    refetchInterval: 10000
  });

  // Enhanced deploy handler with full Vercel API integration
  const handleEnhancedDeploy = async () => {
    setIsAiLoading(true);
    setDeploymentProgress(`Starting enhanced Vercel deployment...`);
    
    try {
      const response = await fetch('/api/vercel/deploy-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectName: 'tycoon-game',
          modules: ['client-core', 'client-components', 'server-api', 'shared-types']
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDeploymentProgress(`✅ Enhanced deployment completed: ${result.deploymentUrl}`);
        
        setChatHistory(prev => [...prev, {
          role: 'ai',
          content: `Enhanced Vercel deployment completed successfully. URL: ${result.deploymentUrl}. Project ID: ${result.projectId}. View details at: ${result.vercelDashboard}`,
          model: selectedAiModel,
          timestamp: new Date().toISOString()
        }]);
        
        refetch();
      } else {
        if (result.needsSetup) {
          setChatHistory(prev => [...prev, {
            role: 'ai',
            content: `Enhanced deployment requires VERCEL_TOKEN. Please provide your Vercel API token in the Secrets tab. Instructions: ${JSON.stringify(result.setupInstructions)}`,
            model: selectedAiModel,
            timestamp: new Date().toISOString()
          }]);
        } else {
          throw new Error(result.error || 'Enhanced deployment failed');
        }
      }
    } catch (error: any) {
      setDeploymentProgress(`❌ Enhanced deployment failed: ${error.message}`);
      
      setChatHistory(prev => [...prev, {
        role: 'ai',
        content: `Enhanced deployment failed: ${error.message}. Check Vercel API configuration and try again.`,
        model: selectedAiModel,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Modular deploy handler for deploying specific modules
  const handleModularDeploy = async (modules?: string[]) => {
    setIsAiLoading(true);
    setDeploymentProgress(`Starting modular deployment...`);
    
    try {
      const response = await fetch('/api/vercel/deploy-modular-real', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          modules: modules || ['client-core', 'client-components', 'client-pages', 'server-api', 'shared-types'],
          skipDependencies: false
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDeploymentProgress(`✅ Modular deployment completed: ${result.successfulModules}/${result.totalModules} modules`);
        
        setChatHistory(prev => [...prev, {
          role: 'ai',
          content: `Modular deployment completed successfully. Deployed modules: ${result.summary.deployed.join(', ')}. ${result.failedModules > 0 ? `Failed: ${result.summary.failed.join(', ')}` : ''}`,
          model: selectedAiModel,
          timestamp: new Date().toISOString()
        }]);
        
        // Refresh deployment status
        refetch();
      } else {
        throw new Error(result.error || 'Modular deployment failed');
      }
    } catch (error: any) {
      setDeploymentProgress(`❌ Modular deployment failed: ${error.message}`);
      
      setChatHistory(prev => [...prev, {
        role: 'ai',
        content: `Modular deployment failed: ${error.message}. Try individual module deployment or standard deployment instead.`,
        model: selectedAiModel,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Unified deploy handler with modular options
  const handleDeploy = async (type: 'quick' | 'production' | 'fix') => {
    setIsAiLoading(true);
    setDeploymentProgress(`Starting ${type} deployment...`);
    
    try {
      // Try Vercel API first (no CLI dependency)
      let endpoint = '/api/vercel/api-deploy';
      let payload = {
        deploymentType: type,
        includeModules: type === 'quick' ? ['client'] : ['client', 'server', 'shared']
      };

      // If fix type, try AI fix first
      if (type === 'fix') {
        endpoint = '/api/vercel/ai-fix';
        payload = {
          aiModel: selectedAiModel,
          errorType: vercelData?.errorCode || 'BUILD_ERROR',
          errorMessage: vercelData?.errorMessage || 'Deployment issues detected'
        };
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDeploymentProgress(`✅ ${type} deployment completed`);
        
        const successMessage = type === 'fix' 
          ? `Fix applied successfully: ${result.fixSolution?.solution || 'Issues resolved'}`
          : `${type} deployment completed. ${result.deploymentUrl ? `URL: ${result.deploymentUrl}` : ''}`;
          
        setChatHistory(prev => [...prev, {
          role: 'ai',
          content: successMessage,
          model: selectedAiModel,
          timestamp: new Date().toISOString()
        }]);
        
        setTimeout(() => refetchVercel(), 2000);
      } else {
        // If Vercel API fails, try GitHub deployment as fallback
        if (result.errorType === 'INVALID_TOKEN' && type !== 'fix') {
          setDeploymentProgress('⚠️ Vercel token issue, trying GitHub deployment...');
          await handleGitHubDeployFallback(type);
        } else {
          setDeploymentProgress(`❌ ${type} deployment failed: ${result.error}`);
          setChatHistory(prev => [...prev, {
            role: 'ai',
            content: `Deployment failed: ${result.error}. ${result.suggestion || 'Please check configuration.'}`,
            model: 'system',
            timestamp: new Date().toISOString()
          }]);
        }
      }
    } catch (error) {
      setDeploymentProgress('❌ Deployment connection error');
      setChatHistory(prev => [...prev, {
        role: 'ai',
        content: 'Connection error during deployment. Please check network and try again.',
        model: 'system',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // GitHub deployment fallback
  const handleGitHubDeployFallback = async (type: 'quick' | 'production') => {
    try {
      const response = await fetch('/api/github/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiModel: selectedAiModel,
          message: `AI-optimized ${type} deployment`
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDeploymentProgress('✅ GitHub deployment setup completed');
        setChatHistory(prev => [...prev, {
          role: 'ai',
          content: `GitHub deployment configured: ${result.message}. Next steps: ${result.nextSteps?.join(', ')}`,
          model: selectedAiModel,
          timestamp: new Date().toISOString()
        }]);
      } else {
        setDeploymentProgress('❌ GitHub deployment setup failed');
      }
    } catch (error) {
      setDeploymentProgress('❌ GitHub deployment connection error');
    }
  };

  // AI Assistant handlers
  const handleAIChat = async (message: string, model: string) => {
    setIsAiLoading(true);
    
    try {
      const response = await fetch('/api/vercel/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationHistory: chatHistory,
          aiModel: model
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const aiContent = result.response?.content || result.response?.groq?.content || result.response?.gemini?.content;
        
        setChatHistory(prev => [...prev, 
          { role: 'user', content: message, timestamp: new Date().toISOString() },
          { role: 'ai', content: aiContent, model: result.model, timestamp: new Date().toISOString() }
        ]);
      }
    } catch (error) {
      console.error('AI chat error:', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAIMonitor = async (model: string) => {
    if (!vercelData?.uid) return;
    
    setIsAiLoading(true);
    
    try {
      const response = await fetch(`/api/vercel/ai-monitor/${vercelData.uid}?aiModel=${model}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success) {
        const insights = result.aiInsights;
        setChatHistory(prev => [...prev, {
          role: 'ai',
          content: `Monitoring complete for deployment ${vercelData.uid}:\nStatus: ${result.deployment.state}\n${insights ? `Analysis: ${insights.errorAnalysis || insights.analysis}` : 'System operating normally'}`,
          model: insights?.model || model,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('AI monitor error:', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAIFix = async (model: string) => {
    setIsAiLoading(true);
    
    try {
      const response = await fetch('/api/vercel/ai-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorType: vercelData?.errorCode || 'BUILD_ERROR',
          errorMessage: vercelData?.errorMessage || 'Deployment issues detected',
          aiModel: model
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const solution = result.fixSolution;
        setChatHistory(prev => [...prev, {
          role: 'ai',
          content: `Issue analysis complete:\n${solution?.solution || solution?.groq?.solution || solution?.gemini?.solution || 'Automated fixes applied'}`,
          model: solution?.model || model,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('AI fix error:', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">System Control Center</h1>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </Button>
          </div>
        </div>

        {/* Primary Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Dashboard */}
          <StatusDashboard 
            systemStatus={systemData}
            deploymentStatus={vercelData}
            autoExpand="onError"
          />

          {/* Deploy Manager */}
          <DeployManager
            onDeploy={handleDeploy}
            onModularDeploy={handleModularDeploy}
            onEnhancedDeploy={handleEnhancedDeploy}
            isLoading={isAiLoading}
            status={vercelData?.state === 'ERROR' ? 'error' : 
                   vercelData?.state === 'BUILDING' ? 'building' : 
                   vercelData?.state === 'READY' ? 'success' : 'ready'}
            lastDeployment={{
              url: vercelData?.url,
              timestamp: vercelData?.createdAt,
              status: vercelData?.state
            }}
          />
        </div>

        {/* Vercel Dashboard */}
        <VercelDashboard className="mb-4" />

        {/* AI Assistant */}
        <AIAssistant
          onChat={handleAIChat}
          onMonitor={handleAIMonitor}
          onFix={handleAIFix}
          chatHistory={chatHistory}
          isLoading={isAiLoading}
          selectedModel={selectedAiModel}
          onModelChange={setSelectedAiModel}
        />

        {/* Advanced Sections */}
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/20">
            <TabsTrigger value="stats" className="text-white data-[state=active]:bg-purple-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="tech" className="text-white data-[state=active]:bg-purple-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              Tech Stack
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-white data-[state=active]:bg-purple-600">
              <Settings className="w-4 h-4 mr-2" />
              Dev Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4">
            {/* Deployment Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/5 border border-purple-400/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Deployment Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  {deploymentStats ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Deployments</span>
                        <span className="text-white">{deploymentStats.stats.totalDeployments}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Error Rate</span>
                        <span className="text-red-300">{deploymentStats.stats.errorRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg Build Time</span>
                        <span className="text-blue-300">{Math.round(deploymentStats.stats.averageBuildTime / 60)}m</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">Loading statistics...</div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/5 border border-purple-400/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Live Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  {liveMetrics ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Active Builds</span>
                        <span className="text-orange-300">{liveMetrics.metrics.currentBuilds}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Response Time</span>
                        <span className="text-green-300">{liveMetrics.metrics.avgResponseTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Uptime</span>
                        <span className="text-green-300">{liveMetrics.metrics.uptime.toFixed(2)}%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">Loading metrics...</div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/5 border border-purple-400/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  {deploymentProgress ? (
                    <div className="text-sm text-gray-300">{deploymentProgress}</div>
                  ) : (
                    <div className="text-gray-400 text-sm">Ready for deployment</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tech" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border border-purple-400/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Frontend Stack
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>React</span>
                      <Badge variant="default">18.3.1</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>TypeScript</span>
                      <Badge variant="default">5.6.3</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Vite</span>
                      <Badge variant="default">5.4.19</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border border-purple-400/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Backend Stack
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Node.js</span>
                      <Badge variant="default">20.x</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Express</span>
                      <Badge variant="default">4.x</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>PostgreSQL</span>
                      <Badge variant="default">15.x</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <Card className="bg-white/5 border border-purple-400/20">
              <CardHeader>
                <CardTitle>Development Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-300">
                  Advanced development tools and manual controls are available for system administrators.
                  Use the AI Assistant for automated troubleshooting and deployment management.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}