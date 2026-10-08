import React from 'react';
import { CompetitionItem } from './Competitions';
import { GKExamRenderer } from './renderers/GKExamRenderer';
import { VivaExamRenderer } from './renderers/VivaExamRenderer';
import { ConceptualExamRenderer } from './renderers/ConceptualExamRenderer';

export interface CompetitionExamScreenProps {
  comp: CompetitionItem;
  userId?: string | number;
  initialData?: any;
  onExit: () => void;
  onComplete: (resultData?: any) => void;
}

export const CompetitionExamScreen: React.FC<CompetitionExamScreenProps> = ({
  comp,
  userId,
  initialData,
  onExit,
  onComplete
}) => {
  const moduleTypeUpper = (comp.module_type || 'TAM').toUpperCase();

  if (moduleTypeUpper === 'GK') {
    return (
      <GKExamRenderer
        comp={comp}
        userId={userId}
        initialData={initialData}
        onExit={onExit}
        onComplete={onComplete}
      />
    );
  }

  if (moduleTypeUpper === 'VIVA') {
    return (
      <VivaExamRenderer
        comp={comp}
        userId={userId}
        initialData={initialData}
        onExit={onExit}
        onComplete={onComplete}
      />
    );
  }

  /* Default / Conceptual TAM Module */
  return (
    <ConceptualExamRenderer
      comp={comp}
      userId={userId}
      initialData={initialData}
      onExit={onExit}
      onComplete={onComplete}
    />
  );
};

export default CompetitionExamScreen;
