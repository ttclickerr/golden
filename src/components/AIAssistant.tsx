import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Brain, MessageSquare, Activity, Wrench, Send, Settings } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  model?: string;
  timestamp?: string;
}

interface AIAssistantProps {
  onChat: (message: string, model: string) => void;
  onMonitor: (model: string) => void;
  onFix: (model: string) => void;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export default function AIAssistant({ 
  onChat, 
  onMonitor, 
  onFix, 
  chatHistory, 
  isLoading, 
  selectedModel, 
  onModelChange 
}: AIAssistantProps) {
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSendMessage = () => {
    if (message.trim()) {
      onChat(message, selectedModel);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="bg-white/5 border border-purple-400/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            AI Assistant
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger className="w-32 h-8 text-xs bg-black/20 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900/95 border-gray-700">
                <SelectItem value="groq" className="text-white hover:bg-gray-800">GROQ</SelectItem>
                <SelectItem value="gemini" className="text-white hover:bg-gray-800">Gemini 2.0</SelectItem>
                <SelectItem value="combined" className="text-white hover:bg-gray-800">Combined</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => onMonitor(selectedModel)}
            variant="outline"
            size="sm"
            className="text-xs h-8 border-blue-400/40 text-blue-300 hover:bg-blue-400/10"
            disabled={isLoading}
          >
            <Activity className="w-3 h-3 mr-1" />
            Monitor
          </Button>
          <Button
            onClick={() => onFix(selectedModel)}
            variant="outline"
            size="sm"
            className="text-xs h-8 border-red-400/40 text-red-300 hover:bg-red-400/10"
            disabled={isLoading}
          >
            <Wrench className="w-3 h-3 mr-1" />
            Fix Issues
          </Button>
          <Button
            onClick={() => onChat('Analyze current deployment status', selectedModel)}
            variant="outline"
            size="sm"
            className="text-xs h-8 border-purple-400/40 text-purple-300 hover:bg-purple-400/10"
            disabled={isLoading}
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Analyze
          </Button>
        </div>

        {/* Chat Interface */}
        <div className="space-y-3">
          {/* Chat History */}
          {isExpanded && chatHistory.length > 0 && (
            <div className="bg-black/20 rounded-lg p-3 max-h-64 overflow-y-auto space-y-2">
              {chatHistory.slice(-5).map((msg, index) => (
                <div key={index} className={`text-xs ${msg.role === 'user' ? 'text-blue-300' : 'text-gray-300'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {msg.role === 'user' ? 'You' : msg.model || 'AI'}
                    </Badge>
                    {msg.timestamp && (
                      <span className="text-gray-500 text-xs">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <div className="ml-2 whitespace-pre-wrap">{msg.content}</div>
                </div>
              ))}
            </div>
          )}

          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask AI about deployment, errors, or optimizations..."
              className="flex-1 bg-black/20 border-gray-600 text-white placeholder-gray-400 text-sm"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Last AI Response */}
        {chatHistory.length > 0 && !isExpanded && (
          <div className="bg-black/20 rounded p-2 text-xs text-gray-300">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">
                {chatHistory[chatHistory.length - 1]?.model || 'AI'}
              </Badge>
            </div>
            <div className="truncate">
              {chatHistory[chatHistory.length - 1]?.content.substring(0, 100)}...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}