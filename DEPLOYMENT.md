# Guide de déploiement AlertDisparu

## Configuration Supabase

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau compte ou connectez-vous
3. Cliquez sur "New Project"
4. Choisissez une organisation et un nom de projet
5. Créez un mot de passe sécurisé pour la base de données
6. Choisissez une région proche de vos utilisateurs
7. Cliquez sur "Create new project"

### 2. Configuration de la base de données

1. Dans le tableau de bord Supabase, allez dans l'onglet "SQL Editor"
2. Cliquez sur "New query"
3. Copiez et collez le contenu du fichier `supabase-setup.sql`
4. Cliquez sur "Run" pour exécuter le script
5. Vérifiez que les tables `profiles` et `missing_persons` ont été créées

### 3. Récupérer les clés API

1. Allez dans "Settings" > "API"
2. Copiez l'URL du projet (Project URL)
3. Copiez la clé publique anonyme (anon public key)

### 4. Configuration de l'authentification

1. Allez dans "Authentication" > "Settings"
2. Dans "General", configurez :
   - Site URL: `http://localhost:5173` (pour le développement)
   - Redirect URLs: `http://localhost:5173` (pour le développement)
3. Dans "Email", configurez vos paramètres d'email si nécessaire
4. Activez l'inscription par email

## Configuration locale

### 1. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anonyme-supabase
```

### 2. Test local

```bash
npm install
npm run dev
```

Vérifiez que l'application se charge correctement et que vous pouvez vous inscrire/se connecter.

## Déploiement en production

### Option 1: Vercel (Recommandé)

1. Connectez votre compte GitHub à [Vercel](https://vercel.com)
2. Importez votre repository
3. Configurez les variables d'environnement :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Déployez

### Option 2: Netlify

1. Connectez votre compte GitHub à [Netlify](https://netlify.com)
2. Importez votre repository
3. Configurez les variables d'environnement
4. Déployez

### Option 3: Build statique

```bash
npm run build
```

Les fichiers de build seront dans le dossier `dist/`.

## Configuration Supabase pour la production

### 1. Mise à jour des URLs

1. Dans Supabase, allez dans "Authentication" > "Settings"
2. Mettez à jour :
   - Site URL: `https://votre-domaine.com`
   - Redirect URLs: `https://votre-domaine.com`

### 2. Configuration CORS

1. Allez dans "Settings" > "API"
2. Ajoutez votre domaine dans les "Allowed Origins"

### 3. Politiques de sécurité

Vérifiez que les politiques RLS (Row Level Security) sont bien activées :

```sql
-- Vérifier les politiques
SELECT * FROM pg_policies WHERE tablename IN ('profiles', 'missing_persons');
```

## Monitoring et maintenance

### 1. Surveillance des erreurs

- Configurez des alertes sur les erreurs Supabase
- Surveillez les logs d'authentification
- Vérifiez les performances de la base de données

### 2. Sauvegarde

- Supabase effectue des sauvegardes automatiques
- Configurez des sauvegardes supplémentaires si nécessaire

### 3. Mises à jour

- Surveillez les mises à jour de Supabase
- Testez les nouvelles versions en local avant déploiement
- Maintenez les dépendances à jour

## Dépannage

### Problèmes courants

1. **Erreur de connexion Supabase**
   - Vérifiez les variables d'environnement
   - Vérifiez l'URL et la clé API

2. **Problème d'authentification**
   - Vérifiez les politiques RLS
   - Vérifiez la configuration des redirects

3. **Erreurs de build**
   - Vérifiez les types TypeScript
   - Vérifiez les imports

### Support

- Documentation Supabase: https://supabase.com/docs
- Issues GitHub: Créez une issue sur le repository
