# Script PowerShell pour démarrer le serveur de développement
Write-Host "🚀 Démarrage du serveur de développement AlertDisparu..." -ForegroundColor Green

# Vérifier si npm est installé
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Vérifier si le fichier package.json existe
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json non trouvé dans le répertoire courant" -ForegroundColor Red
    exit 1
}

# Installer les dépendances si nécessaire
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
        exit 1
    }
}

# Démarrer le serveur de développement
Write-Host "🌐 Lancement du serveur de développement..." -ForegroundColor Green
Write-Host "📱 L'application sera disponible sur http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Ouvrez la console du navigateur (F12) pour voir les logs détaillés" -ForegroundColor Yellow
Write-Host ""

npm run dev
