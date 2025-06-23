import { useState, useEffect } from "react";
import { useGameState } from "@/lib/stores/useGameState";
import { Tutorial } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * Компонент для отображения обучения в игре
 */
export default function TutorialOverlay() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<Tutorial | null>(null);
  
  const { tutorial, tutorialCompleted, completeTutorialStep } = useGameState();
  
  useEffect(() => {
    // Если обучение уже завершено, не показываем его
    if (tutorialCompleted) return;
    
    // Находим первый незавершенный шаг обучения
    const nextStep = tutorial.find(step => !step.completed);
    
    if (nextStep) {
      setCurrentStep(nextStep);
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [tutorial, tutorialCompleted]);
  
  const handleCompleteStep = () => {
    if (currentStep) {
      // Если это последний шаг обучения
      const isLastStep = tutorial.filter(t => !t.completed).length === 1;
      
      // Отмечаем текущий шаг как завершенный
      completeTutorialStep(currentStep.id);
      
      // Если это последний шаг, закрываем диалог
      if (isLastStep) {
        setOpen(false);
      } else {
        // Иначе находим следующий шаг
        const nextStep = tutorial.find(step => !step.completed);
        setCurrentStep(nextStep || null);
      }
    }
  };
  
  // Если нет текущего шага или обучение завершено, не показываем ничего
  if (!currentStep || tutorialCompleted) return null;
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-gradient-to-br from-[#1a1c2e] to-[#2d2f45] border-[#4cc3a5] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#4cc3a5]">
            {currentStep.title}
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-base pt-2">
            {currentStep.description}
          </DialogDescription>
        </DialogHeader>
        
        {/* Пример содержания с инструкциями */}
        <div className="py-4">
          <div className="rounded-lg bg-[rgba(0,0,0,0.2)] p-4 text-sm">
            <p>Шаг {currentStep.step} из {tutorial.length}</p>
            <div className="mt-2 h-2 bg-[rgba(255,255,255,0.1)] rounded-full">
              <div
                className="h-full bg-[#4cc3a5] rounded-full transition-all"
                style={{ width: `${(currentStep.step / tutorial.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            onClick={handleCompleteStep}
            className="w-full bg-[#4cc3a5] hover:bg-[#3bb394] text-black"
          >
            Понятно
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}