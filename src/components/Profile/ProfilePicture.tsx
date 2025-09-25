import React, { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { User, Camera, Upload, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const ProfilePicture: React.FC = () => {
  const { user } = useAuthStore();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un fichier image valide' });
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'La taille du fichier ne doit pas dépasser 5MB' });
      return;
    }

    // Convertir en base64 pour prévisualisation
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePicture(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!profilePicture || !user?.id) return;

    setLoading(true);
    setMessage(null);

    try {
      console.log('🖼️ Tentative de mise à jour de la photo de profil...');
      console.log('👤 Utilisateur ID:', user.id);
      console.log('📸 Photo (premiers 100 chars):', profilePicture.substring(0, 100) + '...');

      // Pour cette implémentation simple, on stocke l'image en base64
      // Dans une vraie app, vous voudriez uploader vers Supabase Storage
      const { data, error } = await supabase
        .from('profiles')
        .update({
          profile_picture: profilePicture,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select();

      console.log('📊 Réponse Supabase:', { data, error });

      if (error) {
        console.error('❌ Erreur Supabase:', error);
        
        // Messages d'erreur plus spécifiques
        let errorMessage = 'Erreur lors de la mise à jour de la photo';
        
        if (error.message.includes('column "profile_picture" does not exist')) {
          errorMessage = 'La colonne profile_picture n\'existe pas dans la base de données. Veuillez exécuter le script SQL fourni.';
        } else if (error.message.includes('permission denied')) {
          errorMessage = 'Permissions insuffisantes pour mettre à jour le profil';
        } else if (error.message.includes('row-level security')) {
          errorMessage = 'Erreur de sécurité au niveau des lignes. Vérifiez les politiques RLS.';
        }
        
        setMessage({ type: 'error', text: errorMessage });
        return;
      }

      console.log('✅ Photo mise à jour avec succès');
      setMessage({ type: 'success', text: 'Photo de profil mise à jour avec succès' });
    } catch (error) {
      console.error('💥 Exception lors de la mise à jour:', error);
      setMessage({ type: 'error', text: 'Erreur inattendue lors de la mise à jour de la photo' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePicture = async () => {
    if (!user?.id) return;

    setLoading(true);
    setMessage(null);

    try {
      console.log('🗑️ Suppression de la photo de profil...');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          profile_picture: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        setMessage({ type: 'error', text: 'Erreur lors de la suppression de la photo' });
        return;
      }

      setProfilePicture(null);
      setMessage({ type: 'success', text: 'Photo de profil supprimée avec succès' });
    } catch (error) {
      console.error('💥 Exception lors de la suppression:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression de la photo' });
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseConnection = async () => {
    setLoading(true);
    setMessage(null);

    try {
      console.log('🔍 Test de connexion à la base de données...');
      
      // Tester la lecture de la table profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, profile_picture')
        .eq('id', user?.id)
        .single();

      console.log('📊 Test de lecture:', { data, error });

      if (error) {
        if (error.message.includes('column "profile_picture" does not exist')) {
          setMessage({ 
            type: 'error', 
            text: '❌ La colonne profile_picture n\'existe pas. Exécutez le script SQL fourni.' 
          });
        } else {
          setMessage({ 
            type: 'error', 
            text: `❌ Erreur de connexion: ${error.message}` 
          });
        }
      } else {
        setMessage({ 
          type: 'success', 
          text: '✅ Connexion à la base de données réussie !' 
        });
      }
    } catch (error) {
      console.error('💥 Exception lors du test:', error);
      setMessage({ 
        type: 'error', 
        text: '❌ Erreur inattendue lors du test de connexion' 
      });
    } finally {
      setLoading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Camera className="h-5 w-5 mr-2" />
          Photo de profil
        </h3>
      </CardHeader>
      <CardContent>
        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <span className={`text-sm ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message.text}
            </span>
          </div>
        )}

        {/* Photo Preview */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Photo de profil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            
            {profilePicture && (
              <button
                onClick={handleRemovePicture}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-2 w-full">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              onClick={openFileDialog}
              variant="outline"
              className="flex items-center justify-center"
              disabled={loading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {profilePicture ? 'Changer la photo' : 'Ajouter une photo'}
            </Button>

            {profilePicture && (
              <Button
                onClick={handleUpload}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Upload en cours...' : 'Sauvegarder la photo'}
              </Button>
            )}

            {/* Bouton de test pour diagnostiquer les problèmes */}
            <Button
              onClick={testDatabaseConnection}
              variant="outline"
              size="sm"
              disabled={loading}
              className="w-full text-xs"
            >
              🔍 Tester la connexion DB
            </Button>
          </div>

          {/* Info */}
          <p className="text-xs text-gray-500 text-center">
            Formats acceptés: JPG, PNG, GIF (max 5MB)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
