import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  Lightbulb, 
  Clock, 
  Target, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { GeminiResolutionScenario } from '../../services/geminiResolutionScenarios';

interface OptimizedScenarioCardProps {
  scenario: GeminiResolutionScenario;
  title: string;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

// Composant mémoïsé pour éviter les re-renders inutiles
export const OptimizedScenarioCard = memo<OptimizedScenarioCardProps>(({
  scenario,
  title,
  index,
  isExpanded,
  onToggle
}) => {
  // Mémoïsation des couleurs de probabilité
  const probabilityConfig = useMemo(() => {
    const configs = {
      high: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
      medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: TrendingUp },
      low: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle }
    };
    return configs[scenario.probability] || configs.medium;
  }, [scenario.probability]);

  // Mémoïsation des badges de probabilité
  const probabilityBadge = useMemo(() => {
    const ProbabilityIcon = probabilityConfig.icon;
    return (
      <Badge 
        variant="outline" 
        className={`${probabilityConfig.color} flex items-center gap-1`}
      >
        <ProbabilityIcon className="h-3 w-3" />
        {scenario.probability === 'high' ? 'Élevée' : 
         scenario.probability === 'medium' ? 'Moyenne' : 'Faible'}
      </Badge>
    );
  }, [probabilityConfig]);

  // Mémoïsation du contenu réduit
  const reducedContent = useMemo(() => (
    <div className="space-y-3">
      {/* Description réduite */}
      <div>
        <p className="text-gray-700 leading-relaxed text-sm">
          {scenario.description.length > 200 
            ? `${scenario.description.substring(0, 200)}...` 
            : scenario.description}
        </p>
      </div>
      
      {/* Informations clés réduites */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" size="sm" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {scenario.timeline}
        </Badge>
        <Badge variant="outline" size="sm" className="flex items-center gap-1">
          <Target className="h-3 w-3" />
          {scenario.actions.length} action{scenario.actions.length > 1 ? 's' : ''}
        </Badge>
        <Badge variant="outline" size="sm" className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {scenario.resources.length} ressource{scenario.resources.length > 1 ? 's' : ''}
        </Badge>
        {probabilityBadge}
      </div>
    </div>
  ), [scenario.description, scenario.timeline, scenario.actions.length, scenario.resources.length, probabilityBadge]);

  // Mémoïsation du contenu étendu
  const expandedContent = useMemo(() => (
    <div className="space-y-4">
      {/* Description complète */}
      <div>
        <p className="text-gray-700 leading-relaxed">
          {scenario.description}
        </p>
      </div>
      
      {/* Timeline */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h5 className="font-medium text-blue-900 mb-2 flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Timeline estimée
        </h5>
        <p className="text-blue-800">{scenario.timeline}</p>
      </div>
      
      {/* Actions recommandées */}
      <div>
        <h5 className="font-medium text-gray-900 mb-3 flex items-center">
          <Target className="h-4 w-4 mr-2 text-blue-600" />
          Actions recommandées
        </h5>
        <ul className="space-y-2">
          {scenario.actions.map((action, actionIndex) => (
            <li key={actionIndex} className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{action}</span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Facteurs clés */}
      <div>
        <h5 className="font-medium text-gray-900 mb-3 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
          Facteurs clés
        </h5>
        <div className="flex flex-wrap gap-2">
          {scenario.keyFactors.map((factor, factorIndex) => (
            <Badge key={factorIndex} variant="secondary" className="text-xs">
              {factor}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Ressources nécessaires */}
      <div>
        <h5 className="font-medium text-gray-900 mb-3 flex items-center">
          <Users className="h-4 w-4 mr-2 text-orange-600" />
          Ressources nécessaires
        </h5>
        <div className="flex flex-wrap gap-2">
          {scenario.resources.map((resource, resourceIndex) => (
            <Badge key={resourceIndex} variant="outline" className="text-xs">
              {resource}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  ), [scenario]);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
              <Lightbulb className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{title}</h4>
              <div className="flex items-center gap-2 mt-1">
                {probabilityBadge}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggle}
            leftIcon={isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          >
            {isExpanded ? 'Réduire' : 'Développer'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isExpanded ? expandedContent : reducedContent}
      </CardContent>
    </Card>
  );
});

OptimizedScenarioCard.displayName = 'OptimizedScenarioCard';
