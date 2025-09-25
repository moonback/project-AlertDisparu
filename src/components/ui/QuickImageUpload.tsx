import React, { useRef, useState } from 'react';
import { Button } from './Button';
import { Alert } from './Alert';
import { Upload, Image, X, CheckCircle } from 'lucide-react';

interface QuickImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  className?: string;
}

export const QuickImageUpload: React.FC<QuickImageUploadProps> = ({
  onImageSelect,
  selectedFile,
  onClear,
  className = ''
}) => {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setError('Seules les images sont autorisées');
      return;
    }

    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5MB');
      return;
    }

    onImageSelect(file);
    
    // Réinitialiser l'input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (selectedFile) {
    return (
      <div className={`border border-green-200 bg-green-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">
                Image sélectionnée : {selectedFile.name}
              </p>
              <p className="text-xs text-green-700">
                {(selectedFile.size / 1024 / 1024).toFixed(1)}MB
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            leftIcon={<X className="h-4 w-4" />}
          >
            Changer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        <div className="text-center">
          <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ajoutez une photo pour l'analyse IA
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            L'IA analysera votre photo et remplira automatiquement les champs descriptifs
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={openFileDialog}
            leftIcon={<Upload className="h-4 w-4" />}
          >
            Sélectionner une photo
          </Button>
          
          <p className="text-xs text-gray-500 mt-3">
            Formats supportés : JPG, PNG, GIF (max 5MB)
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="error" title="Erreur">
          {error}
        </Alert>
      )}
    </div>
  );
};
