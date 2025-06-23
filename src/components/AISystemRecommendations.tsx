import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, RefreshCw, AlertTriangle, CheckCircle, TrendingUp, Zap } from "lucide-react";

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: "performance" | "security" | "build" | "analytics" | "monetization";
  action_required: boolean;
  estimated_impact: string;
  implementation_steps: string[];
}

interface AIAnalysis {
  timestamp: string;
  system_status: string;
  recommendations: AIRecommendation[];
  performance_score: number;
  security_score: number;
  optimization_opportunities: string[];
  ai_insights: {
    trend_analysis: string;
    predictive_warnings: string[];
    growth_opportunities: string[];
  };
}

function PriorityIcon({ priority }: { priority: string }) {
  switch (priority) {
    case "high":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "medium":
      return <TrendingUp className="h-4 w-4 text-yellow-500" />;
    case "low":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    default:
      return <Zap className="h-4 w-4 text-blue-500" />;
  }
}

function CategoryBadge({ category }: { category: string }) {
  const colors = {
    performance: "bg-blue-600",
    security: "bg-red-600", 
    build: "bg-orange-600",
    analytics: "bg-purple-600",
    monetization: "bg-green-600"
  };
  
  return (
    <Badge className={`${colors[category as keyof typeof colors]} text-white`}>
      {category}
    </Badge>
  );
}

export default function AISystemRecommendations() {
  const { data: aiAnalysis, isLoading, refetch } = useQuery<AIAnalysis>({
    queryKey: ["/api/ai/system-analysis"],
    refetchInterval: 300000, // Every 5 minutes
  });

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI System Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full mr-3" />
            <span className="text-gray-400">Analyzing system with AI...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!aiAnalysis) {
    return (
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI System Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">AI analysis requires Gemini API key</p>
            <p className="text-sm text-gray-500">
              Configure GEMINI_API_KEY to enable intelligent system recommendations
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mb-6">
      {/* AI Analysis Overview */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              AI System Analysis
            </CardTitle>
            <Button 
              onClick={() => refetch()} 
              size="sm" 
              variant="outline"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Analysis
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-400">Performance Score</p>
              <p className="text-2xl font-bold text-blue-400">{aiAnalysis.performance_score}/100</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-400">Security Score</p>
              <p className="text-2xl font-bold text-green-400">{aiAnalysis.security_score}/100</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-400">Recommendations</p>
              <p className="text-2xl font-bold text-purple-400">{aiAnalysis.recommendations.length}</p>
            </div>
          </div>

          {/* AI Insights */}
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-semibold mb-2">Trend Analysis</h4>
              <p className="text-gray-300 text-sm">{aiAnalysis.ai_insights.trend_analysis}</p>
            </div>

            {aiAnalysis.ai_insights.predictive_warnings.length > 0 && (
              <div>
                <h4 className="text-yellow-400 font-semibold mb-2">Predictive Warnings</h4>
                <ul className="space-y-1">
                  {aiAnalysis.ai_insights.predictive_warnings.map((warning, index) => (
                    <li key={index} className="text-yellow-300 text-sm flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {aiAnalysis.ai_insights.growth_opportunities.length > 0 && (
              <div>
                <h4 className="text-green-400 font-semibold mb-2">Growth Opportunities</h4>
                <ul className="space-y-1">
                  {aiAnalysis.ai_insights.growth_opportunities.map((opportunity, index) => (
                    <li key={index} className="text-green-300 text-sm flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" />
                      {opportunity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiAnalysis.recommendations.map((recommendation) => (
              <div 
                key={recommendation.id} 
                className="bg-gray-700 rounded-lg p-4 border-l-4 border-purple-500"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <PriorityIcon priority={recommendation.priority} />
                    <h4 className="text-white font-semibold">{recommendation.title}</h4>
                  </div>
                  <div className="flex gap-2">
                    <CategoryBadge category={recommendation.category} />
                    {recommendation.action_required && (
                      <Badge variant="destructive">Action Required</Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm mb-3">{recommendation.description}</p>
                
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-1">Estimated Impact:</p>
                  <p className="text-sm text-blue-400">{recommendation.estimated_impact}</p>
                </div>

                {recommendation.implementation_steps.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Implementation Steps:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      {recommendation.implementation_steps.map((step, index) => (
                        <li key={index} className="text-xs text-gray-300">{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>

          {aiAnalysis.recommendations.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-400">No critical recommendations at this time</p>
              <p className="text-sm text-gray-500">Your system is performing well!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization Opportunities */}
      {aiAnalysis.optimization_opportunities.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Optimization Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiAnalysis.optimization_opportunities.map((opportunity, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <p className="text-sm text-gray-300">{opportunity}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}