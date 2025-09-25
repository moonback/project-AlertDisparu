import React, { useState } from 'react';
import { HelpCircle, X, MapPin, Search, Filter, Layers, Bell, Share2, Eye } from 'lucide-react';

interface MapHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MapHelp: React.FC<MapHelpProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const features = [
    {
      icon: <Search className="h-5 w-5" />,
      title: "Recherche intelligente",
      description: "Recherchez par nom, ville ou autres critères. Les résultats se filtrent automatiquement sur la carte."
    },
    {
      icon: <Filter className="h-5 w-5" />,
      title: "Filtres avancés",
      description: "Filtrez par genre, type de cas, priorité, âge et plage de dates pour une recherche précise."
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Marqueurs colorés",
      description: "Les couleurs indiquent la priorité : rouge (critique), orange (élevée), jaune (moyenne), gris (faible)."
    },
    {
      icon: <Bell className="h-5 w-5" />,
      title: "Alertes de proximité",
      description: "Recevez des notifications pour les disparitions dans un rayon de 50km de votre position."
    },
    {
      icon: <Layers className="h-5 w-5" />,
      title: "Couches de carte",
      description: "Basculez entre vue standard, satellite et topographique pour une meilleure analyse."
    },
    {
      icon: <Eye className="h-5 w-5" />,
      title: "Informations détaillées",
      description: "Cliquez sur un marqueur pour voir les détails complets et accéder au rapport complet."
    },
    {
      icon: <Share2 className="h-5 w-5" />,
      title: "Partage rapide",
      description: "Partagez facilement les informations de disparition via les réseaux sociaux ou messagerie."
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
            Guide d'utilisation de la carte
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Découvrez toutes les fonctionnalités de cette carte interactive pour vous aider à localiser les personnes disparues.
          </p>
          
          <div className="grid gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg text-blue-600">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">💡 Conseils d'utilisation</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Utilisez la géolocalisation pour voir les disparitions près de vous</li>
              <li>• Les marqueurs violets indiquent les cas d'urgence</li>
              <li>• Le cercle bleu montre votre zone de recherche (50km)</li>
              <li>• Cliquez sur "Voir les détails" pour plus d'informations</li>
            </ul>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Compris, merci !
          </button>
        </div>
      </div>
    </div>
  );
};
