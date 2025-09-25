// Exemple de configuration des variables d'environnement
// Copiez ce fichier vers .env à la racine du projet

export const ENV_EXAMPLE = `
# Configuration Supabase
# Remplacez ces valeurs par vos vraies clés Supabase

# URL de votre projet Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# Clé anonyme de votre projet Supabase
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Exemple :
# VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NjQ5NjgwMCwiZXhwIjoxOTYyMDcyODAwfQ.example_key_here
`;

// Instructions pour configurer Supabase
export const SETUP_INSTRUCTIONS = {
  title: "Configuration Supabase",
  steps: [
    "1. Créez un projet sur supabase.com",
    "2. Copiez l'URL et la clé anonyme de votre projet",
    "3. Créez un fichier .env à la racine avec les variables ci-dessus",
    "4. Exécutez le script SQL dans supabase-setup.sql",
    "5. Redémarrez l'application"
  ]
};
