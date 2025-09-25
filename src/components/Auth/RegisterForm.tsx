import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Link, useNavigate } from 'react-router-dom';
import { USER_ROLES } from '../../utils/roles';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Rejoindre AlertDisparu
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Créez un compte pour aider à retrouver les personnes disparues
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                {...register('firstName')}
                error={errors.firstName?.message}
                required
              />
              
              <Input
                label="Nom"
                {...register('lastName')}
                error={errors.lastName?.message}
                required
              />
            </div>
            
            <Input
              label="Adresse email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              required
            />
            
            <Select
              label="Rôle"
              options={roleOptions}
              {...register('role')}
              error={errors.role?.message}
              required
            />
            
            <Input
              label="Mot de passe"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              required
            />
            
            <Input
              label="Confirmer le mot de passe"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
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
            Créer le compte
          </Button>
          
          <div className="text-center">
            <span className="text-gray-600">Vous avez déjà un compte ? </span>
            <Link to="/connexion" className="text-red-600 hover:text-red-700 font-medium">
              Se connecter ici
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};