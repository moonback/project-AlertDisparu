# Page de Profil - Documentation

## Vue d'ensemble

La page de profil (`/profil`) est une page complète qui permet aux utilisateurs de gérer leurs informations personnelles, visualiser leurs statistiques et gérer leurs rapports de disparition.

## Fonctionnalités

### 1. Informations Personnelles
- **Modification du profil** : Prénom, nom, email, rôle
- **Changement de mot de passe** : Avec validation et confirmation
- **Photo de profil** : Upload et gestion d'image (base64)
- **Suppression de compte** : Avec confirmation

### 2. Statistiques Utilisateur
- Total des rapports créés
- Nombre de rapports actifs
- Nombre de personnes retrouvées
- Rapports créés ce mois-ci
- Vue d'ensemble annuelle

### 3. Gestion des Rapports
- Liste de tous les rapports créés par l'utilisateur
- Statut de chaque rapport (actif, retrouvé, fermé)
- Accès rapide aux détails de chaque rapport
- Bouton pour créer un nouveau rapport

### 4. Activité Récente
- Historique des actions récentes
- Rapports consultés
- Alertes de proximité
- Timeline des événements

## Structure des Composants

```
src/
├── pages/
│   └── ProfilePage.tsx          # Page principale du profil
└── components/
    └── Profile/
        ├── UserStats.tsx        # Statistiques utilisateur
        ├── UserReports.tsx      # Liste des rapports utilisateur
        ├── ProfilePicture.tsx   # Gestion photo de profil
        └── RecentActivity.tsx   # Activité récente
```

## Navigation

La page de profil est accessible via :
- **Header** : Clic sur le nom d'utilisateur
- **URL directe** : `/profil`
- **Route protégée** : Nécessite une authentification

## Sécurité

- **Authentification requise** : Route protégée
- **Validation des données** : Côté client et serveur
- **Gestion des erreurs** : Messages d'erreur explicites
- **Confirmation** : Pour les actions sensibles (suppression compte)

## Base de Données

### Table `profiles`
```sql
- id (UUID, PK)
- email (TEXT)
- first_name (TEXT)
- last_name (TEXT)
- role (TEXT)
- profile_picture (TEXT, base64)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Relations
- Un profil → Plusieurs rapports (`missing_persons.created_by`)
- Un utilisateur → Un profil (1:1)

## Responsive Design

- **Mobile** : Layout en colonne unique
- **Tablet** : Layout hybride
- **Desktop** : Layout en 2 colonnes (contenu principal + sidebar)

## État de l'Application

La page utilise le store Zustand pour :
- **Authentification** : `useAuthStore`
- **Rapports** : `useMissingPersonsStore`
- **Persistance** : Données sauvegardées localement

## Gestion des Erreurs

- **Messages d'erreur** : Affichage contextuel
- **États de chargement** : Spinners et désactivation des boutons
- **Validation** : Temps réel avec feedback visuel
- **Fallback** : États d'erreur gracieux

## Personnalisation

### Thème
- Couleurs cohérentes avec l'application
- Icônes Lucide React
- Design system Tailwind CSS

### Internationalisation
- Textes en français
- Format de dates français
- Numéros d'urgence français (112, 17)

## Performance

- **Chargement paresseux** : Composants chargés à la demande
- **Mise en cache** : Données utilisateur persistées
- **Optimisation** : Requêtes batch pour les statistiques
- **Images** : Compression et validation de taille

## Tests

### Tests Recommandés
1. **Authentification** : Accès avec/sans connexion
2. **Modification profil** : Validation des champs
3. **Changement mot de passe** : Sécurité et validation
4. **Upload photo** : Types de fichiers et tailles
5. **Suppression compte** : Confirmation et nettoyage
6. **Responsive** : Différentes tailles d'écran

## Déploiement

### Prérequis
- Base de données Supabase configurée
- Tables `profiles` et `missing_persons` créées
- Variables d'environnement définies
- RLS policies configurées

### Variables d'Environnement
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Maintenance

### Logs
- Console logs pour le debugging
- Messages d'erreur utilisateur
- Tracking des actions importantes

### Monitoring
- Erreurs de validation
- Échecs d'upload
- Problèmes d'authentification
- Performance des requêtes

## Améliorations Futures

1. **Upload vers Supabase Storage** : Remplacer base64
2. **Notifications push** : Alertes en temps réel
3. **Export de données** : PDF/Excel des rapports
4. **Historique complet** : Logs détaillés
5. **Thèmes** : Mode sombre/clair
6. **API REST** : Endpoints dédiés
7. **Webhooks** : Intégrations externes
