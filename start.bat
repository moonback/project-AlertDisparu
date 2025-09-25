@echo off
echo 🚀 Démarrage de SafeFind...

REM Vérifier si Node.js est installé
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/
    pause
    exit /b 1
)

REM Vérifier si npm est installé
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm n'est pas installé. Veuillez installer Node.js avec npm.
    pause
    exit /b 1
)

echo ✅ Node.js et npm sont installés

REM Installer les dépendances si nécessaire
if not exist "node_modules" (
    echo 📦 Installation des dépendances...
    npm install
)

REM Vérifier si le fichier .env.local existe
if not exist ".env.local" (
    echo ⚠️  Le fichier .env.local n'existe pas.
    echo 📝 Création du fichier .env.local...
    
    (
        echo # Variables d'environnement Supabase
        echo # Remplacez ces valeurs par vos propres clés Supabase
        echo.
        echo VITE_SUPABASE_URL=https://votre-projet.supabase.co
        echo VITE_SUPABASE_ANON_KEY=votre-cle-anonyme-supabase
    ) > .env.local
    
    echo ✅ Fichier .env.local créé
    echo 🔧 Veuillez configurer vos clés Supabase dans le fichier .env.local
    echo 📖 Consultez DEPLOYMENT.md pour les instructions détaillées
    echo.
    echo Appuyez sur une touche pour continuer ou fermez cette fenêtre pour configurer Supabase...
    pause
)

echo 🚀 Lancement de l'application de développement...
npm run dev
