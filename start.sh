#!/bin/bash

# Script de démarrage rapide pour SafeFind

echo "🚀 Démarrage de SafeFind..."

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/"
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez installer Node.js avec npm."
    exit 1
fi

echo "✅ Node.js et npm sont installés"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Vérifier si le fichier .env.local existe
if [ ! -f ".env.local" ]; then
    echo "⚠️  Le fichier .env.local n'existe pas."
    echo "📝 Création du fichier .env.local..."
    
    cat > .env.local << EOF
# Variables d'environnement Supabase
# Remplacez ces valeurs par vos propres clés Supabase

VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anonyme-supabase
EOF
    
    echo "✅ Fichier .env.local créé"
    echo "🔧 Veuillez configurer vos clés Supabase dans le fichier .env.local"
    echo "📖 Consultez DEPLOYMENT.md pour les instructions détaillées"
    echo ""
    echo "Presser Ctrl+C pour arrêter et configurer Supabase, ou attendre 5 secondes pour continuer..."
    sleep 5
fi

echo "🚀 Lancement de l'application de développement..."
npm run dev
