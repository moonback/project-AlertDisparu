import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { Alert } from './Alert';
import { Upload, X, Image, Eye, Trash2, Brain } from 'lucide-react';

export interface PhotoUploadItem {
  id: string;
  file: File;
  preview: string;
  description: string;
}

interface PhotoUploadProps {
  photos: PhotoUploadItem[];
  onPhotosChange: (photos: PhotoUploadItem[]) => void;
  onImageSelectForAnalysis?: (file: File) => void;
  maxPhotos?: number;
  maxSizeMB?: number;
  className?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photos,
  onPhotosChange,
  onImageSelectForAnalysis,
  maxPhotos = 5,
  maxSizeMB = 5,
  className = ''
}) => {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setError(null);

    // Vérifier le nombre de photos
    if (photos.length + files.length > maxPhotos) {
      setError(`Vous ne pouvez ajouter que ${maxPhotos} photos maximum`);
      return;
    }

    // Vérifier la taille des fichiers
    const oversizedFiles = files.filter(file => file.size > maxSizeMB * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`Certains fichiers dépassent ${maxSizeMB}MB`);
      return;
    }

    // Vérifier le type de fichier
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setError('Seules les images sont autorisées');
      return;
    }

    // Créer les objets PhotoUploadItem
    const newPhotos: PhotoUploadItem[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      description: ''
    }));

    onPhotosChange([...photos, ...newPhotos]);
    
    // Réinitialiser l'input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (photoId: string) => {
    const photoToRemove = photos.find(p => p.id === photoId);
    if (photoToRemove) {
      URL.revokeObjectURL(photoToRemove.preview);
    }
    onPhotosChange(photos.filter(p => p.id !== photoId));
  };

  const updatePhotoDescription = (photoId: string, description: string) => {
    onPhotosChange(photos.map(p => 
      p.id === photoId ? { ...p, description } : p
    ));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyzeImage = (photo: PhotoUploadItem) => {
    if (onImageSelectForAnalysis) {
      onImageSelectForAnalysis(photo.file);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos de l'observation
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Ajoutez jusqu'à {maxPhotos} photos (max {maxSizeMB}MB chacune)
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          type="button"
          variant="outline"
          onClick={openFileDialog}
          leftIcon={<Upload className="h-4 w-4" />}
          disabled={photos.length >= maxPhotos}
        >
          {photos.length === 0 ? 'Ajouter des photos' : `Ajouter des photos (${photos.length}/${maxPhotos})`}
        </Button>
      </div>

      {error && (
        <Alert variant="error" title="Erreur">
          {error}
        </Alert>
      )}

      {photos.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">
            Photos ajoutées ({photos.length})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Image className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {(photo.file.size / 1024 / 1024).toFixed(1)}MB
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    {onImageSelectForAnalysis && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAnalyzeImage(photo)}
                        leftIcon={<Brain className="h-4 w-4" />}
                        title="Analyser avec IA"
                      >
                        Analyser
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePhoto(photo.id)}
                      leftIcon={<Trash2 className="h-4 w-4" />}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
                
                <div className="mb-3">
                  <img
                    src={photo.preview}
                    alt="Aperçu"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600">
                    Description (optionnelle)
                  </label>
                  <textarea
                    value={photo.description}
                    onChange={(e) => updatePhotoDescription(photo.id, e.target.value)}
                    placeholder="Décrivez ce que montre cette photo..."
                    rows={2}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
