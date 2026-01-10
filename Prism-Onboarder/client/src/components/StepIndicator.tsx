import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  locked?: boolean;
}

export function StepIndicator({ steps, currentStep, locked = false }: StepIndicatorProps) {
  return (
    <div className="w-full" data-testid="step-indicator">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLocked = locked && index > currentStep;
          
          return (
            <div key={step} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    isCompleted && "bg-foreground text-background",
                    isCurrent && "bg-foreground text-background ring-4 ring-muted",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground",
                    isLocked && "opacity-50"
                  )}
                  data-testid={`step-${index}`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center max-w-[80px]",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                    isLocked && "opacity-50"
                  )}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-[2px] flex-1 mx-2 transition-colors duration-300",
                    index < currentStep ? "bg-foreground" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}