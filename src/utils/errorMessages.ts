// Messages d'erreur en français pour l'authentification Supabase

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Identifiants de connexion invalides',
  'Email not confirmed': 'Email non confirmé',
  'User not found': 'Utilisateur non trouvé',
  'Invalid email': 'Adresse email invalide',
  'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
  'User already registered': 'Utilisateur déjà enregistré',
  'Email rate limit exceeded': 'Limite de taux d\'email dépassée',
  'Signup is disabled': 'L\'inscription est désactivée',
  'Email address is already registered': 'Cette adresse email est déjà enregistrée',
  'Unable to validate email address: invalid format': 'Impossible de valider l\'adresse email : format invalide',
  'For security purposes, you can only request this once every 60 seconds': 'Pour des raisons de sécurité, vous ne pouvez demander cela qu\'une fois toutes les 60 secondes',
};

export const getAuthErrorMessage = (error: string): string => {
  return AUTH_ERROR_MESSAGES[error] || 'Une erreur est survenue. Veuillez réessayer.';
};

export const DATABASE_ERROR_MESSAGES: Record<string, string> = {
  'duplicate key value violates unique constraint': 'Cette valeur existe déjà',
  'foreign key constraint fails': 'Contrainte de clé étrangère échouée',
  'check constraint': 'Contrainte de vérification échouée',
  'not null constraint': 'Ce champ est obligatoire',
  'violates check constraint': 'Cette valeur ne respecte pas les contraintes',
};

export const getDatabaseErrorMessage = (error: string): string => {
  const matchedKey = Object.keys(DATABASE_ERROR_MESSAGES).find(key => 
    error.toLowerCase().includes(key.toLowerCase())
  );
  
  return matchedKey ? DATABASE_ERROR_MESSAGES[matchedKey] : 'Erreur de base de données. Veuillez réessayer.';
};

export const NETWORK_ERROR_MESSAGES: Record<string, string> = {
  'Failed to fetch': 'Impossible de se connecter au serveur',
  'Network request failed': 'Échec de la requête réseau',
  'Connection timeout': 'Délai de connexion dépassé',
  'Server error': 'Erreur du serveur',
};

export const getNetworkErrorMessage = (error: string): string => {
  return NETWORK_ERROR_MESSAGES[error] || 'Erreur de connexion. Vérifiez votre connexion internet.';
};
