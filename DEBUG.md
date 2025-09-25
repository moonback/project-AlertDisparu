# Guide de débogage AlertDisparu

## 🚀 Démarrage du serveur

### PowerShell (recommandé)
```powershell
# Option 1: Utiliser le script
.\start-dev.ps1

# Option 2: Commandes séparées
npm run dev
```

### CMD
```cmd
npm run dev
```

## 🔍 Débogage de la soumission de rapport

### 1. Vérifier la console du navigateur
- Ouvrez F12 (Outils de développement)
- Allez dans l'onglet "Console"
- Essayez de soumettre un rapport
- Regardez les logs avec les emojis :
  - 🚀 Début soumission rapport
  - 📝 Données du rapport à envoyer
  - 🔍 Store: Début addReport avec
  - 👤 Vérification utilisateur
  - 📦 Payload pour Supabase
  - 📊 Réponse Supabase

### 2. Vérifier l'authentification
```javascript
// Dans la console du navigateur
console.log('Utilisateur actuel:', await window.supabase.auth.getUser());
```

### 3. Vérifier la configuration Supabase
```javascript
// Dans la console du navigateur
console.log('URL Supabase:', import.meta.env.VITE_SUPABASE_URL);
console.log('Clé Supabase:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurée' : 'Manquante');
```

## 🐛 Problèmes courants

### Erreur "Variables d'environnement Supabase manquantes"
- Vérifiez que le fichier `.env` existe à la racine
- Vérifiez que les variables sont correctes :
  ```
  VITE_SUPABASE_URL=https://votre-projet.supabase.co
  VITE_SUPABASE_ANON_KEY=votre_clé_anon
  ```

### Erreur RLS (Row Level Security)
- Vérifiez que vous êtes connecté
- Vérifiez les politiques RLS dans Supabase
- Vérifiez que la table `missing_persons` existe

### Erreur de schéma
- Vérifiez que les colonnes correspondent au schéma
- Vérifiez les types de données (lat/lng en numeric)

### Pas de logs dans la console
- Vérifiez que la console est ouverte (F12)
- Vérifiez que les logs ne sont pas filtrés
- Rechargez la page et réessayez

## 📊 Vérification de la base de données

### Dans Supabase Dashboard
1. Allez dans "Table Editor"
2. Vérifiez que la table `missing_persons` existe
3. Vérifiez les colonnes et types
4. Vérifiez les politiques RLS

### Test direct avec Supabase
```javascript
// Dans la console du navigateur
const { data, error } = await window.supabase
  .from('missing_persons')
  .select('*')
  .limit(5);

console.log('Test direct Supabase:', { data, error });
```

## 🔧 Commandes utiles

### Vérifier les dépendances
```bash
npm list
```

### Reinstaller les dépendances
```bash
npm install
```

### Build de production
```bash
npm run build
```

### Linter
```bash
npm run lint
```

## 📱 URLs importantes

- **Application locale** : http://localhost:5173
- **Supabase Dashboard** : https://supabase.com/dashboard
- **Documentation Supabase** : https://supabase.com/docs

## 🆘 En cas de problème

1. **Vérifiez les logs** dans la console du navigateur
2. **Vérifiez la configuration** Supabase
3. **Vérifiez l'authentification** (connexion utilisateur)
4. **Vérifiez les politiques RLS** dans Supabase
5. **Redémarrez le serveur** si nécessaire

Les logs détaillés vous aideront à identifier exactement où le problème se situe !
