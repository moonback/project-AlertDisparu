import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './Card';
import { Button } from './Button';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { SETUP_INSTRUCTIONS } from '../../config/env.example';

interface SetupHelperProps {
  isVisible: boolean;
  onClose: () => void;
}

export const SetupHelper: React.FC<SetupHelperProps> = ({ isVisible, onClose }) => {
  const [copied, setCopied] = useState(false);

  const envContent = `VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(envContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Configuration Supabase
            </h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Étapes de configuration
            </h3>
            <ol className="space-y-2 text-sm text-gray-700">
              {SETUP_INSTRUCTIONS.steps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="font-medium text-red-600 mr-2">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Variables d'environnement
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Créez un fichier <code className="bg-gray-100 px-1 rounded">.env</code> à la racine du projet :
            </p>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm relative">
              <pre>{envContent}</pre>
              <Button
                size="sm"
                variant="outline"
                onClick={copyToClipboard}
                className="absolute top-2 right-2 bg-white text-gray-900 hover:bg-gray-100"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copié
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copier
                  </>
                )}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Ressources utiles
            </h3>
            <div className="space-y-2">
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Créer un projet Supabase
              </a>
              <a
                href="https://supabase.com/docs/guides/getting-started"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Documentation Supabase
              </a>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              💡 Conseil
            </h4>
            <p className="text-sm text-blue-700">
              Une fois Supabase configuré, l'alerte de mode démo disparaîtra et vous pourrez 
              utiliser toutes les fonctionnalités de l'application avec une vraie base de données.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
