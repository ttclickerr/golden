import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Activity, Code, Smartphone } from "lucide-react";

interface BuildStatus {
  timestamp: string;
  android: {
    project_exists: boolean;
    gradle_version: string;
    dependencies_status: Record<string, string>;
    placeholders_remaining: number;
    production_ready: boolean;
    last_audit: string | null;
    file_structure: Record<string, string>;
    errors: string[];
    recommendations: string[];
  };
  web: {
    status: string;
    dependencies_count: number;
    dev_dependencies_count: number;
    scripts: string[];
    framework: string;
    bundler: string;
    deployment_ready: boolean;
  };
  system: {
    node_version: string;
    platform: string;
    arch: string;
    memory_usage: string;
    uptime_seconds: number;
  };
}

export default function BuildStatusCard() {
  const { data: buildData, isLoading, refetch } = useQuery<BuildStatus>({
    queryKey: ["/api/analytics/builds"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getStatusColor = (status: string) => {
    if (status.includes('✓') || status === 'running') return "bg-green-500/10 text-green-400 border-green-500/20";
    if (status.includes('outdated') || status.includes('missing')) return "bg-red-500/10 text-red-400 border-red-500/20";
    return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Build Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Build Status
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {buildData ? (
          <div className="space-y-6">
            {/* Android Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span className="font-medium">Android Project</span>
                </div>
                <Badge variant="outline" className={
                  buildData.android.project_exists 
                    ? buildData.android.production_ready 
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }>
                  {buildData.android.project_exists 
                    ? buildData.android.production_ready 
                      ? "Production Ready"
                      : `${buildData.android.placeholders_remaining} Placeholders`
                    : "Missing"
                  }
                </Badge>
              </div>
              
              {buildData.android.project_exists && (
                <>
                  <div className="bg-gray-800/50 p-3 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Gradle Version:</span>
                      <span className="text-green-400">{buildData.android.gradle_version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dependencies:</span>
                      <span className="text-blue-400">
                        {Object.values(buildData.android.dependencies_status).filter(v => v.includes('✓')).length}/
                        {Object.keys(buildData.android.dependencies_status).length} Updated
                      </span>
                    </div>
                    {buildData.android.last_audit && buildData.android.last_audit !== "No audit found" && (
                      <div className="flex justify-between">
                        <span>Last Audit:</span>
                        <span className="text-purple-400">
                          {new Date(buildData.android.last_audit).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Dependencies Details */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-300">Dependencies Status:</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(buildData.android.dependencies_status).map(([dep, status]) => (
                        <div key={dep} className="flex justify-between items-center p-2 bg-gray-800/30 rounded">
                          <span className="capitalize">{dep.replace('_', ' ')}:</span>
                          <span className={status.includes('✓') ? 'text-green-400' : 'text-red-400'}>
                            {status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* File Structure Check */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-300">Critical Files:</span>
                    <div className="space-y-1">
                      {Object.entries(buildData.android.file_structure).slice(0, 3).map(([file, status]) => (
                        <div key={file} className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">{file.split('/').pop()}</span>
                          <span className={status.includes('✓') ? 'text-green-400' : 'text-red-400'}>
                            {status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {buildData.android.errors.length > 0 && (
                <div className="space-y-1">
                  <span className="text-red-400 text-sm font-medium flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Issues:
                  </span>
                  {buildData.android.errors.slice(0, 2).map((error, idx) => (
                    <div key={idx} className="text-xs text-red-300 bg-red-500/10 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              )}

              {buildData.android.recommendations.length > 0 && (
                <div className="space-y-1">
                  <span className="text-blue-400 text-sm font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Recommendations:
                  </span>
                  {buildData.android.recommendations.slice(0, 1).map((rec, idx) => (
                    <div key={idx} className="text-xs text-blue-300 bg-blue-500/10 p-2 rounded">
                      {rec}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Web Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  <span className="font-medium">Web Application</span>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                  {buildData.web.status || "Running"}
                </Badge>
              </div>
              
              <div className="bg-gray-800/50 p-3 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Framework:</span>
                  <span className="text-blue-400">{buildData.web.framework}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dependencies:</span>
                  <span className="text-green-400">{buildData.web.dependencies_count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bundler:</span>
                  <span className="text-purple-400">{buildData.web.bundler}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deployment:</span>
                  <span className={buildData.web.deployment_ready ? "text-green-400" : "text-yellow-400"}>
                    {buildData.web.deployment_ready ? "Ready" : "Config needed"}
                  </span>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">System Runtime</span>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                  {buildData.system.platform} {buildData.system.arch}
                </Badge>
              </div>
              
              <div className="bg-gray-800/50 p-3 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Node.js:</span>
                  <span className="text-green-400">{buildData.system.node_version}</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory:</span>
                  <span className="text-blue-400">{buildData.system.memory_usage}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="text-purple-400">{formatUptime(buildData.system.uptime_seconds)}</span>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="text-xs text-gray-500 text-center">
              Last updated: {new Date(buildData.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Failed to load build status
          </div>
        )}
      </CardContent>
    </Card>
  );
}