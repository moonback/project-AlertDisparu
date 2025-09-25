import React from 'react';
import { Badge } from './Badge';
import { CaseType, CasePriority } from '../../types';

interface CaseTypeBadgeProps {
  caseType: CaseType;
  priority?: CasePriority;
  isEmergency?: boolean;
  className?: string;
}

const caseTypeLabels: Record<CaseType, string> = {
  disappearance: 'Disparition',
  runaway: 'Fugue',
  abduction: 'Enlèvement',
  missing_adult: 'Adulte disparu',
  missing_child: 'Enfant disparu'
};

const caseTypeColors: Record<CaseType, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  disappearance: 'default',
  runaway: 'secondary',
  abduction: 'destructive',
  missing_adult: 'outline',
  missing_child: 'destructive'
};

const priorityColors: Record<CasePriority, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  low: 'outline',
  medium: 'default',
  high: 'secondary',
  critical: 'destructive'
};

const priorityLabels: Record<CasePriority, string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Élevée',
  critical: 'Critique'
};

export const CaseTypeBadge: React.FC<CaseTypeBadgeProps> = ({
  caseType,
  priority,
  isEmergency,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={caseTypeColors[caseType]} size="sm">
        {caseTypeLabels[caseType]}
      </Badge>
      
      {priority && (
        <Badge variant={priorityColors[priority]} size="sm">
          {priorityLabels[priority]}
        </Badge>
      )}
      
      {isEmergency && (
        <Badge variant="destructive" size="sm">
          URGENCE
        </Badge>
      )}
    </div>
  );
};
