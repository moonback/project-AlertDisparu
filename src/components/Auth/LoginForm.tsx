import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Link, useNavigate } from 'react-router-dom';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Connexion à AlertDisparu
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Aidez à retrouver les personnes disparues dans votre communauté
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Adresse email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              required
            />
            
            <Input
              label="Mot de passe"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              required
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          
          <Button
            type="submit"
            className="w-full"
            isLoading={loading}
          >
            Se connecter
          </Button>
          
          <div className="text-center">
            <span className="text-gray-600">Vous n'avez pas de compte ? </span>
            <Link to="/inscription" className="text-red-600 hover:text-red-700 font-medium">
              S'inscrire ici
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};