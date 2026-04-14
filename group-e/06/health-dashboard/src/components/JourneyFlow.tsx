import { JourneyHealth } from '../types';
import { StepCard } from './StepCard';

interface JourneyFlowProps {
  journeyHealth: JourneyHealth;
}

export function JourneyFlow({ journeyHealth }: JourneyFlowProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center justify-center min-w-max py-8 px-4">
        {journeyHealth.steps.map((stepHealth, index) => (
          <StepCard
            key={stepHealth.step.id}
            stepHealth={stepHealth}
            isLast={index === journeyHealth.steps.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
