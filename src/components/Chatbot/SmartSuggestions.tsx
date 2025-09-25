import React from 'react';
import { MessageCircle, BarChart3, Target, Search, TrendingUp, Users } from 'lucide-react';

interface SmartSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
  userRole: string;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({ 
  onSuggestionClick, 
  userRole 
}) => {
  // Suggestions adaptées selon le rôle de l'utilisateur
  const getSuggestionsByRole = () => {
    switch (userRole) {
      case 'authority':
        return [
          {
            icon: <BarChart3 className="w-4 h-4" />,
            title: "Analyse des tendances",
            description: "Analyser les patterns de disparition",
            prompt: "Peux-tu analyser les tendances des disparitions récentes et identifier des patterns géographiques ou temporels ?"
          },
          {
            icon: <Target className="w-4 h-4" />,
            title: "Priorités d'investigation",
            description: "Identifier les cas prioritaires",
            prompt: "Quels sont les signalements qui nécessitent une attention immédiate selon les critères de priorité et d'urgence ?"
          },
          {
            icon: <Users className="w-4 h-4" />,
            title: "Coordination des équipes",
            description: "Optimiser la coordination",
            prompt: "Comment puis-je optimiser la coordination entre les différentes équipes d'investigation ?"
          },
          {
            icon: <TrendingUp className="w-4 h-4" />,
            title: "Statistiques de performance",
            description: "Évaluer l'efficacité",
            prompt: "Peux-tu me donner un rapport sur les statistiques de résolution et l'efficacité des investigations ?"
          }
        ];

      case 'family':
        return [
          {
            icon: <Search className="w-4 h-4" />,
            title: "Actions à entreprendre",
            description: "Que puis-je faire maintenant ?",
            prompt: "Quelles sont les actions concrètes que je peux entreprendre pour aider à retrouver ma personne disparue ?"
          },
          {
            icon: <MessageCircle className="w-4 h-4" />,
            title: "Comprendre la situation",
            description: "Expliquer le processus",
            prompt: "Peux-tu m'expliquer comment fonctionne l'investigation et quelles sont les étapes suivantes ?"
          },
          {
            icon: <Target className="w-4 h-4" />,
            title: "Évolution du cas",
            description: "Suivre les progrès",
            prompt: "Peux-tu me donner un résumé de l'évolution de l'investigation et des dernières observations ?"
          },
          {
            icon: <Users className="w-4 h-4" />,
            title: "Ressources disponibles",
            description: "Aide et support",
            prompt: "Quelles ressources et contacts sont disponibles pour nous aider dans cette situation ?"
          }
        ];

      case 'volunteer':
        return [
          {
            icon: <Search className="w-4 h-4" />,
            title: "Comment contribuer",
            description: "Actions bénévoles",
            prompt: "Comment puis-je contribuer efficacement aux recherches en tant que bénévole ?"
          },
          {
            icon: <Target className="w-4 h-4" />,
            title: "Zones à surveiller",
            description: "Où se concentrer",
            prompt: "Quelles sont les zones géographiques où je peux être le plus utile pour les recherches ?"
          },
          {
            icon: <MessageCircle className="w-4 h-4" />,
            title: "Signaler une observation",
            description: "Comment rapporter",
            prompt: "Comment puis-je signaler une observation ou un témoignage de manière efficace ?"
          },
          {
            icon: <Users className="w-4 h-4" />,
            title: "Coordination bénévoles",
            description: "Travailler en équipe",
            prompt: "Comment puis-je me coordonner avec d'autres bénévoles et les équipes officielles ?"
          }
        ];

      default:
        return [
          {
            icon: <BarChart3 className="w-4 h-4" />,
            title: "Aperçu général",
            description: "État des investigations",
            prompt: "Peux-tu me donner un aperçu général de l'état actuel des investigations ?"
          },
          {
            icon: <Search className="w-4 h-4" />,
            title: "Recherche d'informations",
            description: "Trouver des données",
            prompt: "Comment puis-je rechercher des informations spécifiques dans la base de données ?"
          }
        ];
    }
  };

  const suggestions = getSuggestionsByRole();

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-700 mb-3">
        💡 Suggestions intelligentes pour votre rôle ({userRole})
      </div>
      
      <div className="grid gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.prompt)}
            className="flex items-start space-x-3 p-3 text-left bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200 group"
          >
            <div className="flex-shrink-0 p-1.5 bg-blue-100 group-hover:bg-blue-200 rounded-md text-blue-600 transition-colors">
              {suggestion.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-sm group-hover:text-blue-900">
                {suggestion.title}
              </div>
              <div className="text-xs text-gray-600 mt-1 group-hover:text-blue-700">
                {suggestion.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Ces suggestions s'adaptent automatiquement à votre rôle et aux données disponibles
        </div>
      </div>
    </div>
  );
};
