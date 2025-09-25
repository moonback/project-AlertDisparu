import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Link, useNavigate } from 'react-router-dom';
import { USER_ROLES } from '../../utils/roles';
import { Search, User, Mail, Lock, Shield, Users, AlertCircle, CheckCircle } from 'lucide-react';

const registerSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Veuillez saisir une adresse email valide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
  role: z.enum(['family', 'authority', 'volunteer'], {
    required_error: 'Veuillez sélectionner votre rôle'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

type RegisterFormData = z.infer<typeof registerSchema>;

const roleOptions = USER_ROLES.map(role => ({
  value: role.value,
  label: role.label
}));

export const RegisterForm: React.FC = () => {
  const [error, setError] = useState('');
  const { register: registerUser, loading } = useAuthStore();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });
  
  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    
    const result = await registerUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      password: data.password
    });
    
    if (result.success) {
      navigate('/rapports');
    } else {
      setError(result.error || 'Erreur lors de l\'inscription');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Search className="h-12 w-12 text-primary-600" />
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-amber-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rejoindre AlertDisparu
          </h1>
          <p className="text-gray-600">
            Créez votre compte pour aider la communauté
          </p>
        </div>
        
        {/* Form Card */}
        <Card variant="elevated" className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-center text-xl">Créer un compte</CardTitle>
            <CardDescription className="text-center">
              Rejoignez notre communauté pour retrouver les personnes disparues
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Prénom"
                    placeholder="Votre prénom"
                    leftIcon={<User className="h-5 w-5" />}
                    {...register('firstName')}
                    error={errors.firstName?.message}
                    required
                  />
                  
                  <Input
                    label="Nom"
                    placeholder="Votre nom"
                    leftIcon={<User className="h-5 w-5" />}
                    {...register('lastName')}
                    error={errors.lastName?.message}
                    required
                  />
                </div>
                
                <Input
                  label="Adresse email"
                  type="email"
                  placeholder="votre@email.com"
                  leftIcon={<Mail className="h-5 w-5" />}
                  {...register('email')}
                  error={errors.email?.message}
                  required
                />
                
                <Select
                  label="Votre rôle"
                  options={roleOptions}
                  {...register('role')}
                  error={errors.role?.message}
                  required
                />
                
                <Input
                  label="Mot de passe"
                  type="password"
                  placeholder="Choisissez un mot de passe sécurisé"
                  leftIcon={<Lock className="h-5 w-5" />}
                  showPasswordToggle={true}
                  {...register('password')}
                  error={errors.password?.message}
                  required
                />
                
                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  placeholder="Confirmez votre mot de passe"
                  leftIcon={<Lock className="h-5 w-5" />}
                  showPasswordToggle={true}
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                  required
                />
              </div>
              
              {error && (
                <div className="alert-error flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={loading}
                leftIcon={<Users className="h-5 w-5" />}
              >
                Créer mon compte
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <span className="text-gray-600">Vous avez déjà un compte ? </span>
              <Link 
                to="/connexion" 
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                Se connecter ici
              </Link>
            </div>
          </CardContent>
        </Card>
        
        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-xl shadow-soft">
            <Shield className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Sécurisé</h3>
            <p className="text-sm text-gray-600">Conforme RGPD</p>
          </div>
          
          <div className="text-center p-4 bg-white rounded-xl shadow-soft">
            <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Communauté</h3>
            <p className="text-sm text-gray-600">Entraide locale</p>
          </div>
          
          <div className="text-center p-4 bg-white rounded-xl shadow-soft">
            <CheckCircle className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Efficace</h3>
            <p className="text-sm text-gray-600">Alertes rapides</p>
          </div>
        </div>
      </div>
    </div>
  );
};