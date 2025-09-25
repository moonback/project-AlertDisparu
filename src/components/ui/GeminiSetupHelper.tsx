import React from 'react';
import { Card, CardContent, CardHeader } from './Card';
import { Alert } from './Alert';
import { Button } from './Button';
import { Brain, Key, ExternalLink, Info } from 'lucide-react';
import { isGeminiConfigured } from '../../services/gemini';

interface GeminiSetupHelperProps {
  className?: string;
}

export const GeminiSetupHelper: React.FC<GeminiSetupHelperProps> = ({ className = '' }) => {
  const isConfigured = isGeminiConfigured();

  if (isConfigured) {
    return null; // Ne pas afficher si déjà configuré
  }

  return (
    <Card className={`border-blue-200 bg-blue-50 ${className}`}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">
            Analyse intelligente d'images disponible
          </h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert variant="info" title="Fonctionnalité IA">
            <p className="text-sm">
              Activez l'analyse automatique d'images avec Gemini pour remplir automatiquement 
              les champs de votre observation à partir des photos.
            </p>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-medium text-blue-900">Configuration requise :</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center space-x-2">
                <Key className="h-4 w-4" />
                <span>1. Obtenez une clé API Gemini sur Google AI Studio</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="ml-6">2. Ajoutez VITE_GEMINI_API_KEY dans votre fichier .env</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="ml-6">3. Redémarrez le serveur de développement</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ExternalLink className="h-4 w-4" />}
              onClick={() => window.open('https://makersuite.google.com/app/apikey', '_blank')}
            >
              Obtenir une clé API
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Info className="h-4 w-4" />}
              onClick={() => window.open('/GEMINI-SETUP.md', '_blank')}
            >
              Guide de configuration
            </Button>
          </div>

          <div className="text-xs text-blue-700 bg-blue-100 p-3 rounded">
            <strong>Note :</strong> Cette fonctionnalité est optionnelle. Vous pouvez toujours 
            remplir manuellement les champs du formulaire.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
