import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { UserReports } from '../components/Profile/UserReports';
import { UserStats } from '../components/Profile/UserStats';
import { ProfilePicture } from '../components/Profile/ProfilePicture';
import { RecentActivity } from '../components/Profile/RecentActivity';
import { 
  User, 
  Shield, 
  Edit3, 
  Save, 
  X, 
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Activity,
  Database,
  Settings
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
      case 'family': return 'bg-neon-blue/10 text-neon-blue border border-neon-blue/30';
      case 'authority': return 'bg-system-error/10 text-system-error border border-system-error/30';
      case 'volunteer': return 'bg-system-success/10 text-system-success border border-system-success/30';
      default: return 'bg-dark-700/50 text-dark-300 border border-dark-600/50';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
          <Card variant="cyber" className="text-center py-12" glow>
            <CardHeader>
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-system-error/20 rounded-full blur-lg animate-pulse"></div>
                  <div className="relative p-4 bg-system-error/10 rounded-full border border-system-error/30">
                    <AlertTriangle className="h-12 w-12 text-system-error" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-neon-green mb-4">PROFIL INTROUVABLE</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-dark-300 font-mono">IMPOSSIBLE DE CHARGER LES INFORMATIONS DU PROFIL.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden">
      {/* Arrière-plan futuriste */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute inset-0 bg-circuit-pattern opacity-10"></div>
      
      {/* Lignes de données en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-blue/20 to-transparent animate-data-stream"></div>
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-green/10 to-transparent animate-data-stream" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-2/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-purple/10 to-transparent animate-data-stream" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
        {/* Header futuriste */}
        <div className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-6 mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 via-transparent to-neon-purple/5 rounded-2xl"></div>
          <div className="relative">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-neon-blue/20 rounded-full blur-lg animate-pulse"></div>
                <User className="h-10 w-10 text-neon-blue relative z-10" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-white mb-2">
                  CENTRE DE CONTRÔLE UTILISATEUR
                </h1>
                <p className="text-dark-300 font-mono text-sm tracking-wider">
                  GESTION DES INFORMATIONS PERSONNELLES ET PARAMÈTRES DE COMPTE
                </p>
              </div>
            </div>
            
            {/* Indicateurs de statut */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-system-success rounded-full animate-pulse"></div>
                <span className="text-xs font-mono text-dark-400">PROFIL: ACTIF</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-3 w-3 text-neon-blue" />
                <span className="text-xs font-mono text-dark-400">DERNIÈRE ACTIVITÉ: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message futuriste */}
        {message && (
          <Card variant={message.type === 'success' ? 'glass' : 'cyber'} className={`mb-6 ${message.type === 'success' ? '' : 'glow'}`}>
            <CardContent className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-system-success mr-3" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-system-error mr-3 animate-pulse" />
              )}
              <span className={`text-sm font-mono ${
                message.type === 'success' ? 'text-system-success' : 'text-system-error'
              }`}>
                {message.text.toUpperCase()}
              </span>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <Card variant="glass" glow>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-neon-blue">
                  <User className="h-5 w-5 mr-2" />
                  INFORMATIONS PERSONNELLES
                </CardTitle>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="cyber"
                    size="sm"
                    className="flex items-center"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    MODIFIER
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      variant="neon"
                      size="sm"
                      className="flex items-center"
                      glow
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {loading ? 'SAUVEGARDE...' : 'SAUVEGARDER'}
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <X className="h-4 w-4 mr-1" />
                      ANNULER
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-display font-semibold text-white mb-2">
                    PRÉNOM
                  </label>
                  {isEditing ? (
                    <Input
                      variant="glass"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="VOTRE PRÉNOM"
                    />
                  ) : (
                    <p className="text-white font-mono">{user.firstName || 'NON RENSEIGNÉ'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-display font-semibold text-white mb-2">
                    NOM
                  </label>
                  {isEditing ? (
                    <Input
                      variant="glass"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="VOTRE NOM"
                    />
                  ) : (
                    <p className="text-white font-mono">{user.lastName || 'NON RENSEIGNÉ'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-display font-semibold text-white mb-2">
                    EMAIL
                  </label>
                  {isEditing ? (
                    <Input
                      variant="glass"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="VOTRE@EMAIL.COM"
                    />
                  ) : (
                    <p className="text-white font-mono">{user.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-display font-semibold text-white mb-2">
                    RÔLE
                  </label>
                  {isEditing ? (
                    <Select
                      value={formData.role}
                      onChange={(value) => handleInputChange('role', value)}
                      options={[
                        { value: 'volunteer', label: 'BÉNÉVOLE' },
                        { value: 'family', label: 'FAMILLE' },
                        { value: 'authority', label: 'AUTORITÉ' }
                      ]}
                    />
                  ) : (
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-mono font-medium ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card variant="cyber" glow>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-neon-green">
                  <Shield className="h-5 w-5 mr-2" />
                  SÉCURITÉ DU COMPTE
                </CardTitle>
                {!isChangingPassword ? (
                  <Button
                    onClick={() => setIsChangingPassword(true)}
                    variant="neon"
                    size="sm"
                  >
                    CHANGER MOT DE PASSE
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsChangingPassword(false)}
                    variant="outline"
                    size="sm"
                  >
                    ANNULER
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isChangingPassword ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-display font-semibold text-white mb-2">
                      MOT DE PASSE ACTUEL
                    </label>
                    <div className="relative">
                      <Input
                        variant="cyber"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        placeholder="VOTRE MOT DE PASSE ACTUEL"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-neon-green" />
                        ) : (
                          <Eye className="h-4 w-4 text-neon-green" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-display font-semibold text-white mb-2">
                      NOUVEAU MOT DE PASSE
                    </label>
                    <div className="relative">
                      <Input
                        variant="cyber"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        placeholder="NOUVEAU MOT DE PASSE"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-neon-green" />
                        ) : (
                          <Eye className="h-4 w-4 text-neon-green" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-display font-semibold text-white mb-2">
                      CONFIRMER LE NOUVEAU MOT DE PASSE
                    </label>
                    <Input
                      variant="cyber"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      placeholder="CONFIRMER LE NOUVEAU MOT DE PASSE"
                    />
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={loading || !passwordData.newPassword || !passwordData.confirmPassword}
                    variant="neon"
                    className="w-full"
                    glow
                  >
                    {loading ? 'MODIFICATION...' : 'MODIFIER LE MOT DE PASSE'}
                  </Button>
                </div>
              ) : (
                <p className="text-dark-300 font-mono">
                  POUR DES RAISONS DE SÉCURITÉ, CHANGEZ RÉGULIÈREMENT VOTRE MOT DE PASSE.
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
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center text-neon-blue">
                <Database className="h-5 w-5 mr-2" />
                INFORMATIONS DU COMPTE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <dt className="text-sm font-display font-semibold text-white">ID DU COMPTE</dt>
                  <dd className="text-sm text-dark-300 font-mono">{user.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-display font-semibold text-white">RÔLE</dt>
                  <dd>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-mono font-medium ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role).toUpperCase()}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-display font-semibold text-white">EMAIL VÉRIFIÉ</dt>
                  <dd className="text-sm text-white">
                    <span className="inline-flex items-center">
                      <CheckCircle className="h-4 w-4 text-system-success mr-1" />
                      OUI
                    </span>
                  </dd>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card variant="cyber" glow>
            <CardHeader>
              <CardTitle className="flex items-center text-neon-green">
                <Settings className="h-5 w-5 mr-2" />
                ACTIONS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  onClick={logout}
                  variant="outline"
                  className="w-full"
                >
                  SE DÉCONNECTER
                </Button>
                
                <Button
                  onClick={handleDeleteAccount}
                  variant="danger"
                  className="w-full"
                  disabled={loading}
                  glow
                >
                  SUPPRIMER LE COMPTE
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
};
