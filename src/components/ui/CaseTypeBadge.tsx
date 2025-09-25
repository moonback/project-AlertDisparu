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
  disappearance: 'DISPARITION',
  runaway: 'FUGUE',
  abduction: 'ENLÈVEMENT',
  missing_adult: 'ADULTE DISPARU',
  missing_child: 'ENFANT DISPARU'
};

const caseTypeColors: Record<CaseType, 'default' | 'secondary' | 'danger' | 'outline' | 'neon' | 'cyber' | 'glass'> = {
  disappearance: 'neon',
  runaway: 'cyber',
  abduction: 'danger',
  missing_adult: 'glass',
  missing_child: 'danger'
};

const priorityColors: Record<CasePriority, 'default' | 'secondary' | 'danger' | 'outline' | 'neon' | 'cyber' | 'glass'> = {
  low: 'outline',
  medium: 'default',
  high: 'cyber',
  critical: 'danger'
};

const priorityLabels: Record<CasePriority, string> = {
  low: 'FAIBLE',
  medium: 'MOYENNE',
  high: 'ÉLEVÉE',
  critical: 'CRITIQUE'
};

export const CaseTypeBadge: React.FC<CaseTypeBadgeProps> = ({
  caseType,
  priority,
  isEmergency,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant={caseTypeColors[caseType]} 
        size="sm"
        glow={caseType === 'abduction' || caseType === 'missing_child'}
        pulse={isEmergency}
      >
        {caseTypeLabels[caseType]}
      </Badge>
      
      {priority && (
        <Badge 
          variant={priorityColors[priority]} 
          size="sm"
          glow={priority === 'critical'}
          pulse={priority === 'critical' || isEmergency}
        >
          {priorityLabels[priority]}
        </Badge>
      )}
      
      {isEmergency && (
        <Badge 
          variant="danger" 
          size="sm"
          glow
          pulse
        >
          URGENCE
        </Badge>
      )}
    </div>
  );
};
