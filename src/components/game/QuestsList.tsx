import { useState } from "react";
import { useGameState } from "@/lib/stores/useGameState";
import { Quest } from "@/types/game";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, Trophy, Star, TrendingUp, Building, Car, Ship, Coins
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

// Отображение иконки для категории задания
const getCategoryIcon = (category: string) => {
  switch(category) {
    case 'level':
      return <TrendingUp className="w-5 h-5 text-blue-400" />;
    case 'building':
      return <Building className="w-5 h-5 text-green-400" />;
    case 'stock':
      return <TrendingUp className="w-5 h-5 text-purple-400" />;
    case 'crypto':
      return <Coins className="w-5 h-5 text-yellow-400" />;
    case 'vehicle':
      return <Car className="w-5 h-5 text-red-400" />;
    case 'yacht':
      return <Ship className="w-5 h-5 text-cyan-400" />;
    default:
      return <Star className="w-5 h-5 text-yellow-400" />;
  }
};

interface QuestItemProps {
  quest: Quest;
}

const QuestItem = ({ quest }: QuestItemProps) => {
  const { completeQuest } = useGameState();
  const progress = Math.min(quest.progress / quest.target, 1);
  const isComplete = quest.completed;
  
  return (
    <div className={`bg-[rgba(0,0,0,0.2)] rounded-lg p-4 mb-3 border ${isComplete ? 'border-[#4cc3a5]' : 'border-transparent'}`}>
      <div className="flex items-start mb-2 justify-between">
        <div className="flex items-center">
          {getCategoryIcon(quest.category)}
          <div className="ml-3">
            <h3 className="font-semibold text-white">{quest.name}</h3>
            <p className="text-sm text-gray-300">{quest.description}</p>
          </div>
        </div>
        <Badge variant={isComplete ? "default" : "outline"} className={isComplete ? "bg-[#4cc3a5] text-black" : ""}>
          {isComplete ? "Выполнено" : `${Math.floor(progress * 100)}%`}
        </Badge>
      </div>
      
      <div className="mt-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Прогресс: {quest.progress}/{quest.target}</span>
          <span className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            {formatNumber(quest.reward)}
          </span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#4cc3a5] transition-all" 
            style={{ width: `${progress * 100}%` }} 
          />
        </div>
      </div>
      
      {isComplete && quest.reward > 0 && (
        <div className="mt-3 text-right">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-[rgba(76,195,165,0.1)] border-[#4cc3a5] text-[#4cc3a5] hover:bg-[rgba(76,195,165,0.2)]"
            onClick={() => completeQuest(quest.id)}
          >
            Получить награду
          </Button>
        </div>
      )}
    </div>
  );
};

/**
 * Компонент для отображения списка заданий в игре
 */
export default function QuestsList() {
  const { quests } = useGameState();
  const [activeTab, setActiveTab] = useState<string>("active");
  
  // Разделяем задания на активные и выполненные
  const activeQuests = quests.filter(quest => !quest.completed);
  const completedQuests = quests.filter(quest => quest.completed);
  
  return (
    <div className="bg-[rgba(0,0,0,0.3)] rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-[#4cc3a5]" />
          Задания
        </h2>
        <div className="text-sm text-gray-300">
          {completedQuests.length}/{quests.length} выполнено
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="active" className="flex-1 text-white data-[state=active]:bg-[#4cc3a5] data-[state=active]:text-black rounded-lg">
            Активные ({activeQuests.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 text-white data-[state=active]:bg-[#4cc3a5] data-[state=active]:text-black rounded-lg">
            Выполненные ({completedQuests.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <ScrollArea className="h-[300px] pr-4">
            {activeQuests.length > 0 ? (
              activeQuests.map(quest => (
                <QuestItem key={quest.id} quest={quest} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Trophy className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>У вас нет активных заданий</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="completed">
          <ScrollArea className="h-[300px] pr-4">
            {completedQuests.length > 0 ? (
              completedQuests.map(quest => (
                <QuestItem key={quest.id} quest={quest} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Trophy className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>У вас пока нет выполненных заданий</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}