import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Mail, Lock, AlertCircle, Shield } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Veuillez saisir une adresse email valide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const [error, setError] = useState('');
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });
  
  const onSubmit = async (data: LoginFormData) => {
    setError('');
    
    const result = await login(data.email, data.password);
    
    if (result.success) {
      navigate('/rapports');
    } else {
      setError(result.error || 'Erreur de connexion');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Search className="h-12 w-12 text-primary-600" />
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-amber-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Connexion
          </h1>
          <p className="text-gray-600">
            Accédez à votre compte AlertDisparu
          </p>
        </div>
        
        {/* Form Card */}
        <Card variant="elevated" className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-center text-xl">Bienvenue</CardTitle>
            <CardDescription className="text-center">
              Connectez-vous pour aider à retrouver les personnes disparues
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <Input
                  label="Adresse email"
                  type="email"
                  placeholder="votre@email.com"
                  leftIcon={<Mail className="h-5 w-5" />}
                  {...register('email')}
                  error={errors.email?.message}
                  required
                />
                
                <Input
                  label="Mot de passe"
                  type="password"
                  placeholder="Votre mot de passe"
                  leftIcon={<Lock className="h-5 w-5" />}
                  showPasswordToggle={true}
                  {...register('password')}
                  error={errors.password?.message}
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
                leftIcon={<Shield className="h-5 w-5" />}
              >
                Se connecter
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <span className="text-gray-600">Vous n'avez pas de compte ? </span>
              <Link 
                to="/inscription" 
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                S'inscrire ici
              </Link>
            </div>
          </CardContent>
        </Card>
        
        {/* Security Notice */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Shield className="h-4 w-4" />
            <span>Connexion sécurisée et conforme RGPD</span>
          </div>
        </div>
      </div>
    </div>
  );
};