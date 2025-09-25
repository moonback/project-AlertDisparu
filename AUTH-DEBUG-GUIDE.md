# Guide de Débogage de l'Authentification

Ce guide explique comment utiliser les logs complets implémentés pour déboguer l'authentification et la synchronisation avec Supabase.

## 🎯 Vue d'ensemble

Le système d'authentification utilise maintenant des logs détaillés pour tracer :
- Les opérations de connexion/déconnexion
- La synchronisation entre le store Zustand et Supabase
- Les changements d'état d'authentification
- Les erreurs et exceptions

## 📊 Panneau de Débogage Visuel

Un panneau de débogage est affiché en bas à droite de l'application qui montre en temps réel :

### Informations du Store
- **Loading** : État de chargement
- **Authenticated** : État d'authentification
- **Has User** : Présence d'un utilisateur
- **Has Token** : Présence d'un token

### Informations Utilisateur
- **ID** : Identifiant unique
- **Email** : Adresse email
- **Name** : Prénom et nom
- **Role** : Rôle utilisateur

### Session Supabase
- **Has Session** : Présence d'une session
- **User ID** : ID utilisateur dans la session
- **Email** : Email de la session
- **Has Token** : Présence du token d'accès
- **Expires** : Date d'expiration du token

### Statut de Synchronisation
- **Store vs Session** : Cohérence entre le store et Supabase
- **User ID Match** : Correspondance des IDs utilisateur

## 🔍 Logs de la Console

### Tags de Logs

Les logs utilisent des tags colorés pour faciliter le filtrage :

- `🔐 [LOGIN]` - Opérations de connexion
- `📝 [REGISTER]` - Opérations d'inscription
- `🚪 [LOGOUT]` - Opérations de déconnexion
- `🔐 [INIT_AUTH]` - Initialisation de l'authentification
- `🎯 [USE_AUTH]` - Hook useAuth
- `🔄 [AUTH_STATE_CHANGE]` - Changements d'état Supabase
- `📊 [USE_AUTH]` - Mises à jour du store
- `📝 [LOGIN_FORM]` - Formulaire de connexion

### Filtrage dans la Console

Pour filtrer les logs d'authentification dans la console du navigateur :

1. Ouvrir les outils de développement (F12)
2. Aller dans l'onglet Console
3. Utiliser le filtre : `[LOGIN]` ou `[AUTH]` ou `[INIT_AUTH]`

### Exemple de Logs Typiques

#### Connexion Réussie
```
🔐 [LOGIN] Début de la connexion pour: user@example.com
🔐 [LOGIN] Tentative de connexion Supabase...
🔐 [LOGIN] Réponse Supabase: {hasUser: true, hasSession: true, hasError: false}
✅ [LOGIN] Utilisateur trouvé, ID: abc123
👤 [LOGIN] Récupération du profil utilisateur...
👤 [LOGIN] Profil récupéré: {hasProfile: true, hasError: false}
✅ [LOGIN] Utilisateur configuré: {id: "abc123", email: "user@example.com", ...}
🎉 [LOGIN] Connexion réussie et store mis à jour
```

#### Initialisation
```
🔐 [INIT_AUTH] ===========================================
🔐 [INIT_AUTH] Début de l'initialisation de l'authentification
🔐 [INIT_AUTH] État actuel du store: {hasUser: false, isAuthenticated: false, ...}
🔐 [INIT_AUTH] Récupération de la session Supabase...
📋 [INIT_AUTH] Réponse getSession: {hasSession: true, ...}
✅ [INIT_AUTH] Session trouvée pour utilisateur: user@example.com
👤 [INIT_AUTH] Récupération du profil utilisateur...
👥 [INIT_AUTH] Profil récupéré: {hasProfile: true, ...}
✅ [INIT_AUTH] Utilisateur configuré: {...}
🎉 [INIT_AUTH] Store mis à jour avec succès
🔐 [INIT_AUTH] Initialisation terminée - UTILISATEUR CONNECTÉ
```

## 🐛 Débogage des Problèmes Courants

### Problème : Utilisateur non connecté après rafraîchissement

**Symptômes :**
- Panneau de débogage montre "OUT OF SYNC"
- Logs montrent "AUCUNE SESSION" dans INIT_AUTH

**Diagnostic :**
1. Vérifier les logs `[INIT_AUTH]`
2. Chercher les erreurs dans `getSession()`
3. Vérifier la configuration Supabase

### Problème : Token expiré

**Symptômes :**
- Logs montrent `TOKEN_REFRESHED` dans `AUTH_STATE_CHANGE`
- Panneau de débogage montre une date d'expiration passée

**Diagnostic :**
1. Vérifier les logs `[AUTH_STATE_CHANGE]`
2. Observer les tentatives de rafraîchissement automatique
3. Vérifier la configuration des tokens dans Supabase

### Problème : Erreur de profil

**Symptômes :**
- Logs montrent "ERREUR PROFIL" dans `[INIT_AUTH]`
- Panneau de débogage montre "Has User: Yes" mais "Authenticated: No"

**Diagnostic :**
1. Vérifier les logs `[INIT_AUTH]` pour les erreurs de profil
2. Vérifier que la table `profiles` existe
3. Vérifier les permissions RLS

## 🔧 Configuration de Débogage

### Activer/Désactiver le Panneau de Débogage

Pour masquer le panneau de débogage en production :

```typescript
// Dans App.tsx
{process.env.NODE_ENV === 'development' && <AuthDebugPanel />}
```

### Niveaux de Log

Pour ajuster la verbosité des logs, modifier les conditions dans le code :

```typescript
// Exemple : Logs uniquement en mode développement
if (process.env.NODE_ENV === 'development') {
  console.log('🔐 [LOGIN] Message de débogage');
}
```

## 📋 Checklist de Débogage

### Avant de Tester
- [ ] Ouvrir la console du navigateur
- [ ] Vérifier que le panneau de débogage est visible
- [ ] S'assurer que les variables d'environnement Supabase sont configurées

### Pendant les Tests
- [ ] Observer les logs pendant la connexion
- [ ] Vérifier la synchronisation dans le panneau
- [ ] Tester le rafraîchissement de la page
- [ ] Tester la déconnexion

### Après les Tests
- [ ] Vérifier qu'aucune erreur persiste
- [ ] Confirmer que l'état est cohérent
- [ ] Documenter les problèmes rencontrés

## 🚀 Utilisation en Production

En production, il est recommandé de :

1. **Désactiver le panneau de débogage**
2. **Réduire la verbosité des logs**
3. **Utiliser un service de logging externe** (Sentry, LogRocket, etc.)
4. **Implémenter des métriques d'authentification**

## 📞 Support

Si vous rencontrez des problèmes :

1. Consultez d'abord ce guide
2. Vérifiez les logs de la console
3. Utilisez le panneau de débogage pour identifier les incohérences
4. Documentez les erreurs avec les logs correspondants
