import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { 
  Lightbulb, 
  Clock, 
  Target, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  X,
  RefreshCw,
  Save,
  Edit,
  Trash2,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ResolutionScenario as GeminiResolutionScenario } from '../../services/geminiResolutionScenarios';
import { SavedResolutionScenario } from '../../types';

interface ResolutionScenariosProps {
  scenarios?: {
    scenario1: GeminiResolutionScenario;
    scenario2: GeminiResolutionScenario;
    summary: string;
    recommendations: string[];
  };
  savedScenarios?: SavedResolutionScenario[];
  isLoading: boolean;
  savedScenariosLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  onClose?: () => void;
  onUpdateScenario?: (id: string, updates: Partial<SavedResolutionScenario>) => Promise<void>;
  onDeleteScenario?: (id: string) => Promise<void>;
}

export const ResolutionScenarios: React.FC<ResolutionScenariosProps> = ({
  scenarios,
  savedScenarios = [],
  isLoading,
  savedScenariosLoading = false,
  error,
  onRetry,
  onClose,
  onUpdateScenario,
  onDeleteScenario
}) => {
  // États pour gérer l'expansion/réduction des scénarios
  const [expandedScenarios, setExpandedScenarios] = useState<Set<string>>(new Set());
  const [expandedSavedScenarios, setExpandedSavedScenarios] = useState<Set<string>>(new Set());

  // Fonctions pour gérer l'expansion/réduction
  const toggleScenario = (scenarioId: string) => {
    const newExpanded = new Set(expandedScenarios);
    if (newExpanded.has(scenarioId)) {
      newExpanded.delete(scenarioId);
    } else {
      newExpanded.add(scenarioId);
    }
    setExpandedScenarios(newExpanded);
  };

  const toggleSavedScenario = (scenarioId: string) => {
    const newExpanded = new Set(expandedSavedScenarios);
    if (newExpanded.has(scenarioId)) {
      newExpanded.delete(scenarioId);
    } else {
      newExpanded.add(scenarioId);
    }
    setExpandedSavedScenarios(newExpanded);
  };
  if (isLoading) {
    return (
      <Card variant="elevated" className="mb-6">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Génération des scénarios en cours...</h3>
            <p className="text-gray-600">L'IA analyse toutes les informations disponibles pour générer des scénarios de résolution.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="elevated" className="mb-6">
        <CardContent className="p-6">
          <Alert variant="error" title="Erreur lors de la génération">
            <p className="mb-4">{error}</p>
            {onRetry && (
              <Button 
                onClick={onRetry} 
                variant="outline" 
                size="sm"
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Réessayer
              </Button>
            )}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getProbabilityColor = (probability: string) => {
    switch (probability) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getProbabilityText = (probability: string) => {
    switch (probability) {
      case 'high': return 'Probabilité élevée';
      case 'medium': return 'Probabilité moyenne';
      case 'low': return 'Probabilité faible';
      default: return 'Probabilité inconnue';
    }
  };

  const ScenarioCard: React.FC<{ 
    scenario: GeminiResolutionScenario; 
    title: string; 
    index: number;
    isEditable?: boolean;
    isExpanded?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onToggle?: () => void;
  }> = ({ 
    scenario, 
    title, 
    index,
    isEditable = false,
    isExpanded = false,
    onEdit,
    onDelete,
    onToggle
  }) => (
    <Card variant="elevated" className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-primary-600" />
              {title}
            </h3>
            <Badge variant={getProbabilityColor(scenario.probability)} size="lg">
              {getProbabilityText(scenario.probability)}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {onToggle && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggle}
                leftIcon={isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              >
                {isExpanded ? 'Réduire' : 'Développer'}
              </Button>
            )}
            {isEditable && (
              <div className="flex gap-1">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    leftIcon={<Edit className="h-3 w-3" />}
                  >
                    Modifier
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDelete}
                    leftIcon={<Trash2 className="h-3 w-3" />}
                    className="text-red-600 hover:text-red-700"
                  >
                    Supprimer
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isExpanded ? (
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description du scénario</h4>
              <p className="text-gray-700 leading-relaxed">{scenario.description}</p>
            </div>

            {/* Timeline */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-900">Timeline estimée</h4>
              </div>
              <p className="text-blue-800">{scenario.timeline}</p>
            </div>

            {/* Actions */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Target className="h-4 w-4 mr-2 text-green-600" />
                Actions recommandées
              </h4>
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
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
                Facteurs clés
              </h4>
              <div className="flex flex-wrap gap-2">
                {scenario.keyFactors.map((factor, factorIndex) => (
                  <Badge key={factorIndex} variant="outline" size="sm">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Ressources */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2 text-orange-600" />
                Ressources nécessaires
              </h4>
              <div className="flex flex-wrap gap-2">
                {scenario.resources.map((resource, resourceIndex) => (
                  <Badge key={resourceIndex} variant="secondary" size="sm">
                    {resource}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Résumé réduit */}
            <div>
              <p className="text-gray-700 leading-relaxed text-sm">
                {scenario.description.length > 150 
                  ? `${scenario.description.substring(0, 150)}...` 
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
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="mb-6">
      {/* Header avec bouton de fermeture */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Lightbulb className="h-6 w-6 mr-2 text-primary-600" />
            Scénarios de résolution générés par l'IA
          </h2>
          <p className="text-gray-600 mt-1">
            Analyse basée sur toutes les informations disponibles dans la base de données
          </p>
        </div>
        {onClose && (
          <Button 
            onClick={onClose} 
            variant="outline" 
            size="sm"
            leftIcon={<X className="h-4 w-4" />}
          >
            Fermer
          </Button>
        )}
      </div>

      {/* Résumé général */}
      {scenarios && (
        <Card variant="elevated" className="mb-6">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
              Résumé de l'analyse
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{scenarios.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Scénarios sauvegardés */}
      {savedScenarios.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Save className="h-5 w-5 mr-2 text-green-600" />
            Scénarios sauvegardés ({savedScenarios.length})
          </h3>
          {savedScenariosLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-sm text-green-600 mt-2">Chargement des scénarios...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {savedScenarios.map((savedScenario, index) => (
                <Card key={savedScenario.id} variant="elevated" className="border-green-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-green-600" />
                          Généré le {new Date(savedScenario.generationDate).toLocaleDateString('fr-FR')}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Modèle: {savedScenario.aiModelUsed} • Version: {savedScenario.generationVersion}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSavedScenario(`${savedScenario.id}-content`)}
                          leftIcon={expandedSavedScenarios.has(`${savedScenario.id}-content`) ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        >
                          {expandedSavedScenarios.has(`${savedScenario.id}-content`) ? 'Réduire' : 'Développer'}
                        </Button>
                        {onUpdateScenario && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* TODO: Implémenter l'édition */}}
                            leftIcon={<Edit className="h-3 w-3" />}
                          >
                            Modifier
                          </Button>
                        )}
                        {onDeleteScenario && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeleteScenario(savedScenario.id)}
                            leftIcon={<Trash2 className="h-3 w-3" />}
                            className="text-red-600 hover:text-red-700"
                          >
                            Supprimer
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {expandedSavedScenarios.has(`${savedScenario.id}-content`) ? (
                      <div className="space-y-6">
                        {/* Scénario 1 */}
                        <ScenarioCard 
                          scenario={savedScenario.scenario1} 
                          title={savedScenario.scenario1.title}
                          index={1}
                          isExpanded={expandedSavedScenarios.has(`${savedScenario.id}-1`)}
                          onToggle={() => toggleSavedScenario(`${savedScenario.id}-1`)}
                        />
                        {/* Scénario 2 */}
                        <ScenarioCard 
                          scenario={savedScenario.scenario2} 
                          title={savedScenario.scenario2.title}
                          index={2}
                          isExpanded={expandedSavedScenarios.has(`${savedScenario.id}-2`)}
                          onToggle={() => toggleSavedScenario(`${savedScenario.id}-2`)}
                        />
                        {/* Résumé */}
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <h5 className="font-medium text-blue-900 mb-2">Résumé de l'analyse</h5>
                          <p className="text-blue-800">{savedScenario.summary}</p>
                        </div>
                        {/* Recommandations */}
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Recommandations générales
                          </h5>
                          <ul className="space-y-2">
                            {savedScenario.recommendations.map((recommendation, recIndex) => (
                              <li key={recIndex} className="flex items-start">
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{recommendation}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Résumé réduit */}
                        <div>
                          <p className="text-gray-700 leading-relaxed text-sm">
                            {savedScenario.summary.length > 200 
                              ? `${savedScenario.summary.substring(0, 200)}...` 
                              : savedScenario.summary}
                          </p>
                        </div>
                        
                        {/* Informations clés réduites */}
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" size="sm" className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(savedScenario.generationDate).toLocaleDateString('fr-FR')}
                          </Badge>
                          <Badge variant="outline" size="sm" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {savedScenario.recommendations.length} recommandation{savedScenario.recommendations.length > 1 ? 's' : ''}
                          </Badge>
                          <Badge variant="outline" size="sm" className="flex items-center gap-1">
                            <Lightbulb className="h-3 w-3" />
                            {savedScenario.aiModelUsed}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nouveaux scénarios générés */}
      {scenarios && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-primary-600" />
            Nouveaux scénarios générés
          </h3>
          <div className="space-y-6">
            <ScenarioCard 
              scenario={scenarios.scenario1} 
              title={scenarios.scenario1.title}
              index={1}
              isExpanded={expandedScenarios.has('new-1')}
              onToggle={() => toggleScenario('new-1')}
            />
            <ScenarioCard 
              scenario={scenarios.scenario2} 
              title={scenarios.scenario2.title}
              index={2}
              isExpanded={expandedScenarios.has('new-2')}
              onToggle={() => toggleScenario('new-2')}
            />
          </div>
        </div>
      )}

      {/* Message quand aucun scénario n'est disponible */}
      {!scenarios && savedScenarios.length === 0 && !isLoading && !savedScenariosLoading && (
        <div className="text-center py-12">
          <Lightbulb className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun scénario disponible</h3>
          <p className="text-gray-600 mb-6">
            Aucun scénario de résolution n'a encore été généré pour ce rapport.
          </p>
          {onRetry && (
            <Button 
              onClick={onRetry} 
              variant="outline"
              leftIcon={<Lightbulb className="h-4 w-4" />}
            >
              Générer des scénarios
            </Button>
          )}
        </div>
      )}

      {/* Recommandations générales */}
      {scenarios && (
        <Card variant="elevated" className="mt-6">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Recommandations générales
            </h3>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {scenarios.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Note de responsabilité */}
      <Alert variant="info" className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <div>
          <h4 className="font-medium">Note importante</h4>
          <p className="text-sm mt-1">
            Ces scénarios sont générés par une intelligence artificielle basée sur les informations disponibles. 
            Ils doivent être considérés comme des suggestions et non comme des conclusions définitives. 
            Consultez toujours les autorités compétentes pour toute action concrète.
          </p>
        </div>
      </Alert>
    </div>
  );
};
