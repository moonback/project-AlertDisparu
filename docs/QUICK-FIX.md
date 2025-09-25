# 🚨 Résolution rapide - Problème d'authentification

## 🔍 Problème identifié

Les logs montrent :
```
📋 Session Supabase: null
❌ Aucune session trouvée
```

**Cela signifie que vous n'êtes pas connecté à Supabase.**

## ⚡ Solution immédiate

### 1. Connectez-vous à l'application
1. Allez sur **http://localhost:5173/connexion**
2. Utilisez vos identifiants Supabase
3. Ou créez un nouveau compte sur **http://localhost:5173/inscription**

### 2. Vérifiez votre configuration
Assurez-vous que votre fichier `.env` contient :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_anon
```

### 3. Utilisez les outils de diagnostic
Dans l'application, vous verrez maintenant deux boutons :
- **🔍 Auth Debug** (coin bas droit) - Diagnostic complet de l'authentification
- **🔒 Test RLS** (coin bas gauche) - Test des politiques de base de données

## 🛠️ Étapes de débogage

### Étape 1 : Diagnostic d'authentification
1. Cliquez sur **🔍 Auth Debug**
2. Regardez les résultats :
   - **Zustand Store** : État de l'authentification dans l'app
   - **Supabase Session** : Session côté Supabase
   - **Supabase User** : Utilisateur authentifié
   - **Environment** : Variables d'environnement
   - **Supabase Connection** : Connexion à la base

### Étape 2 : Test des politiques RLS
1. Cliquez sur **🔒 Test RLS**
2. Testez d'abord **SELECT** (lecture)
3. Puis testez **INSERT** (écriture)

### Étape 3 : Correction des politiques
Si le test INSERT échoue avec une erreur RLS :
1. Allez dans votre **Supabase Dashboard**
2. Ouvrez l'**éditeur SQL**
3. Exécutez le script `fix-rls-policies.sql`

## 🔧 Problèmes courants

### "Session Supabase: null"
- **Cause** : Pas connecté
- **Solution** : Allez sur /connexion et connectez-vous

### "Variables d'environnement manquantes"
- **Cause** : Fichier .env mal configuré
- **Solution** : Vérifiez le fichier .env à la racine

### "Connexion Supabase échouée"
- **Cause** : Mauvaises clés Supabase
- **Solution** : Vérifiez vos clés dans Supabase Dashboard

### "Erreur RLS lors de l'insertion"
- **Cause** : Politiques de sécurité mal configurées
- **Solution** : Exécutez `fix-rls-policies.sql`

## 📱 URLs importantes

- **Connexion** : http://localhost:5173/connexion
- **Inscription** : http://localhost:5173/inscription
- **Rapports** : http://localhost:5173/rapports
- **Supabase Dashboard** : https://supabase.com/dashboard

## 🎯 Résultat attendu

Après connexion, vous devriez voir :
```
📋 Session Supabase: { user: {...}, access_token: "..." }
👤 Utilisateur trouvé dans la session: [votre-id]
✅ Utilisateur configuré dans le store: {...}
```

Et vous devriez pouvoir soumettre des rapports sans erreur !
