import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { UserReports } from '../components/Profile/UserReports';
import { UserStats } from '../components/Profile/UserStats';
import { ProfilePicture } from '../components/Profile/ProfilePicture';
import { RecentActivity } from '../components/Profile/RecentActivity';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    role: user?.role || 'volunteer'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          role: formData.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) {
        setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil' });
        return;
      }

      // Mettre à jour le store local
      useAuthStore.setState({
        user: {
          ...user!,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role as 'family' | 'authority' | 'volunteer'
        }
      });

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        setMessage({ type: 'error', text: 'Erreur lors du changement de mot de passe' });
        return;
      }

      setMessage({ type: 'success', text: 'Mot de passe modifié avec succès' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du changement de mot de passe' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user?.id);

      if (error) {
        setMessage({ type: 'error', text: 'Erreur lors de la suppression du compte' });
        return;
      }

      await logout();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression du compte' });
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'family': return 'Famille';
      case 'authority': return 'Autorité';
      case 'volunteer': return 'Bénévole';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'family': return 'bg-blue-100 text-blue-800';
      case 'authority': return 'bg-red-100 text-red-800';
      case 'volunteer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Profil introuvable</h1>
          <p className="mt-2 text-gray-600">Impossible de charger les informations du profil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
        <p className="mt-2 text-gray-600">
          Gérez vos informations personnelles et les paramètres de votre compte.
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          )}
          <span className={`text-sm ${
            message.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {message.text}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informations personnelles
                </h3>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      size="sm"
                      className="flex items-center"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Annuler
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Votre prénom"
                    />
                  ) : (
                    <p className="text-gray-900">{user.firstName || 'Non renseigné'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Votre nom"
                    />
                  ) : (
                    <p className="text-gray-900">{user.lastName || 'Non renseigné'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="votre@email.com"
                    />
                  ) : (
                    <p className="text-gray-900">{user.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rôle
                  </label>
                  {isEditing ? (
                    <Select
                      value={formData.role}
                      onChange={(value) => handleInputChange('role', value)}
                      options={[
                        { value: 'volunteer', label: 'Bénévole' },
                        { value: 'family', label: 'Famille' },
                        { value: 'authority', label: 'Autorité' }
                      ]}
                    />
                  ) : (
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Sécurité du compte
                </h3>
                {!isChangingPassword ? (
                  <Button
                    onClick={() => setIsChangingPassword(true)}
                    variant="outline"
                    size="sm"
                  >
                    Changer le mot de passe
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsChangingPassword(false)}
                    variant="outline"
                    size="sm"
                  >
                    Annuler
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isChangingPassword ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        placeholder="Votre mot de passe actuel"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        placeholder="Nouveau mot de passe"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer le nouveau mot de passe
                    </label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      placeholder="Confirmer le nouveau mot de passe"
                    />
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={loading || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="w-full"
                  >
                    {loading ? 'Modification...' : 'Modifier le mot de passe'}
                  </Button>
                </div>
              ) : (
                <p className="text-gray-600">
                  Pour des raisons de sécurité, changez régulièrement votre mot de passe.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <ProfilePicture />
          
          {/* User Stats */}
          <UserStats />
          
          {/* User Reports */}
          <UserReports />
          
          {/* Recent Activity */}
          <RecentActivity />
          
          {/* Account Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Informations du compte
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">ID du compte</dt>
                  <dd className="text-sm text-gray-900 font-mono">{user.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Rôle</dt>
                  <dd>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email vérifié</dt>
                  <dd className="text-sm text-gray-900">
                    <span className="inline-flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      Oui
                    </span>
                  </dd>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  onClick={logout}
                  variant="outline"
                  className="w-full"
                >
                  Se déconnecter
                </Button>
                
                <Button
                  onClick={handleDeleteAccount}
                  variant="outline"
                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  disabled={loading}
                >
                  Supprimer le compte
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
