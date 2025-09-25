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
    <div className="min-h-screen flex items-center justify-center bg-dark-900 relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Arrière-plan futuriste */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute inset-0 bg-circuit-pattern opacity-10"></div>
      
      {/* Lignes de données en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-blue/20 to-transparent animate-data-stream"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-green/10 to-transparent animate-data-stream" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-purple/10 to-transparent animate-data-stream" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header futuriste */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-neon-blue/20 rounded-full blur-xl animate-pulse"></div>
              <Shield className="h-16 w-16 text-neon-blue relative z-10" />
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-system-error rounded-full animate-neon-flicker"></div>
            </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-wider">
            CONNEXION
          </h1>
          <p className="text-dark-300 font-mono text-sm tracking-wider">
            ACCÉDEZ À VOTRE COMPTE ALERTDISPARU
          </p>
          <div className="mt-4 flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-system-success rounded-full animate-pulse"></div>
              <span className="text-xs font-mono text-dark-400">SECURE</span>
            </div>
            <div className="w-px h-4 bg-dark-600"></div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse"></div>
              <span className="text-xs font-mono text-dark-400">ONLINE</span>
            </div>
          </div>
        </div>
        
        {/* Form Card futuriste */}
        <Card variant="glass" className="animate-fade-in" glow>
          <CardHeader>
            <CardTitle className="text-center text-2xl font-display">BIENVENUE</CardTitle>
            <CardDescription className="text-center text-dark-300 font-mono">
              CONNECTEZ-VOUS POUR AIDER À RETROUVER LES PERSONNES DISPARUES
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
                  variant="glass"
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
                  variant="glass"
                  {...register('password')}
                  error={errors.password?.message}
                  required
                />
              </div>
              
              {error && (
                <div className="flex items-center space-x-2 p-4 bg-system-error/10 border border-system-error/30 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-system-error flex-shrink-0" />
                  <span className="text-system-error font-mono text-sm">{error}</span>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full"
                size="lg"
                variant="neon"
                isLoading={loading}
                leftIcon={<Shield className="h-5 w-5" />}
                glow
              >
                SE CONNECTER
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <span className="text-dark-300 font-mono text-sm">Vous n'avez pas de compte ? </span>
              <Link 
                to="/inscription" 
                className="text-neon-blue hover:text-neon-cyan font-display font-semibold transition-colors tracking-wider"
              >
                S'INSCRIRE ICI
              </Link>
            </div>
          </CardContent>
        </Card>
        
        {/* Security Notice futuriste */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-dark-400 font-mono">
            <Shield className="h-4 w-4 text-neon-blue" />
            <span>CONNEXION SÉCURISÉE ET CONFORME RGPD</span>
          </div>
        </div>
      </div>
    </div>
  );
};