import React from 'react';
import { Search, BarChart3, Users, Target, Brain, AlertTriangle } from 'lucide-react';

interface QuickSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
  disabled?: boolean;
}

const quickSuggestions = [
  {
    icon: Search,
    text: "Analyser les signalements actifs",
    query: "Peux-tu me donner un résumé des signalements actifs et leurs priorités ?"
  },
  {
    icon: BarChart3,
    text: "Statistiques des observations",
    query: "Montre-moi les statistiques des observations récentes et les tendances"
  },
  {
    icon: Users,
    text: "Évaluer la crédibilité des témoins",
    query: "Analyse la crédibilité des témoins et leurs observations"
  },
  {
    icon: Target,
    text: "Actions suggérées",
    query: "Quelles actions me suggères-tu pour améliorer les investigations ?"
  },
  {
    icon: Brain,
    text: "Générer des scénarios",
    query: "Peux-tu générer des scénarios de résolution pour les cas prioritaires ?"
  },
  {
    icon: AlertTriangle,
    text: "Cas d'urgence",
    query: "Y a-t-il des cas d'urgence qui nécessitent une attention immédiate ?"
  }
];

export const QuickSuggestions: React.FC<QuickSuggestionsProps> = ({ 
  onSuggestionClick, 
  disabled = false 
}) => {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Suggestions rapides :</h4>
      <div className="grid grid-cols-1 gap-2">
        {quickSuggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion.query)}
              disabled={disabled}
              className="flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 hover:border-gray-300"
            >
              <Icon size={16} className="text-blue-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">{suggestion.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
