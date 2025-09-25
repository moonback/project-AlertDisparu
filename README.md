# AlertDisparu - Plateforme de recherche de personnes disparues

Une application React moderne et sécurisée pour signaler et rechercher des personnes disparues, avec authentification Supabase, géolocalisation intelligente et analyse d'images par IA.

## 🎯 Présentation du projet

AlertDisparu est une plateforme collaborative qui permet aux familles, aux forces de l'ordre et aux bénévoles de signaler des disparitions et de coordonner les recherches. L'application utilise des technologies modernes pour faciliter la géolocalisation, l'analyse d'images et la collaboration entre les différents acteurs.

## 🛠️ Stack technique

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le build et le développement
- **Tailwind CSS** pour le styling
- **React Router** pour la navigation
- **React Hook Form** avec validation Zod
- **Zustand** pour la gestion d'état
- **Leaflet** pour les cartes interactives
- **Lucide React** pour les icônes

### Backend & Base de données
- **Supabase** (PostgreSQL + Auth + Storage)
- **Row Level Security (RLS)** pour la sécurité
- **API REST** automatique via Supabase

### Services externes
- **Google Gemini AI** pour l'analyse d'images
- **Nominatim (OpenStreetMap)** pour le géocodage
- **Supabase Storage** pour les photos

## 🚀 Fonctionnalités principales (MVP)

### 🔐 Authentification et rôles
- **Inscription/Connexion** sécurisée avec Supabase Auth
- **3 types d'utilisateurs** : Famille, Forces de l'ordre, Bénévole
- **Gestion de profil** avec photo et informations personnelles

### 📝 Signalements de disparition
- **Formulaire complet** avec validation Zod
- **Géolocalisation automatique** des adresses
- **Upload de photos** avec analyse IA
- **Types de cas** : Disparition, Fugue, Enlèvement, Adulte/Enfant disparu
- **Niveaux de priorité** : Faible, Moyen, Élevé, Critique
- **Statuts** : Actif, Trouvé, Fermé

### 🔍 Recherche et filtres
- **Recherche textuelle** par nom, ville
- **Filtres avancés** : âge, genre, type de cas, priorité, statut
- **Recherche géographique** par localisation
- **Filtres temporels** par date de disparition

### 🗺️ Cartographie interactive
- **Carte Leaflet** avec marqueurs des disparitions
- **Clustering** des marqueurs pour les zones denses
- **Informations détaillées** au clic sur les marqueurs
- **Filtres sur la carte** par statut et priorité

### 🔬 Système d'investigation
- **Observations d'investigation** par les témoins
- **Analyse d'images IA** avec Google Gemini
- **Niveaux de confiance** : Faible, Moyen, Élevé
- **Vérification** par les autorités
- **Calcul automatique** des distances depuis le lieu de disparition

### 📊 Tableau de bord
- **Statistiques en temps réel** des cas actifs
- **Activité récente** et tendances
- **Alertes de proximité** géographiques
- **Gestion des alertes personnalisées**

## 📋 Prérequis

### Développement
- **Node.js** 18+ 
- **npm** ou **yarn**
- **Git**

### Services externes
- **Compte Supabase** (gratuit)
- **Clé API Google Gemini** (optionnel, pour l'analyse d'images)

## 🚀 Installation et configuration

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd alertdisparu
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Supabase

1. Créez un nouveau projet sur [Supabase](https://supabase.com)
2. Dans le tableau de bord Supabase, allez dans l'éditeur SQL
3. Exécutez les scripts SQL dans l'ordre suivant :
   ```sql
   -- Script principal
   supabase/supabase-setup.sql
   
   -- Extensions (optionnelles)
   supabase/extend-case-types.sql
   supabase/investigation-observations.sql
   supabase/add-photos-to-investigation.sql
   supabase/create-photo-storage.sql
   ```
4. Récupérez votre URL et clé anonyme dans les paramètres du projet

### 4. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Configuration Supabase (requis)
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anonyme-supabase

# Configuration Gemini AI (optionnel)
VITE_GEMINI_API_KEY=votre-cle-api-gemini
```

### 5. Lancer l'application

```bash
# Mode développement
npm run dev

# Build de production
npm run build

# Prévisualisation du build
npm run preview
```

L'application sera accessible sur `http://localhost:5173`

## 📁 Structure du projet

```
src/
├── components/          # Composants React
│   ├── Auth/           # Formulaires d'authentification
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── Investigation/  # Composants d'investigation
│   │   ├── AddObservationForm.tsx
│   │   └── InvestigationObservations.tsx
│   ├── Layout/         # Composants de mise en page
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Layout.tsx
│   │   ├── MobileNavigation.tsx
│   │   └── UserMenu.tsx
│   ├── Map/            # Composants de carte
│   │   └── MissingPersonsMap.tsx
│   ├── Profile/        # Composants de profil
│   │   ├── MyAlerts.tsx
│   │   ├── ProfilePicture.tsx
│   │   ├── RecentActivity.tsx
│   │   ├── UserReports.tsx
│   │   └── UserStats.tsx
│   ├── Reports/        # Composants de signalements
│   │   ├── EditReport.tsx
│   │   ├── ReportCard.tsx
│   │   ├── ReportDetail.tsx
│   │   ├── ReportForm.tsx
│   │   └── SearchFilters.tsx
│   └── ui/             # Composants UI réutilisables
│       ├── Alert.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── ImageAnalysis.tsx
│       ├── LoadingSpinner.tsx
│       ├── Modal.tsx
│       └── ...
├── config/             # Configuration
│   └── env.example.ts
├── hooks/              # Hooks personnalisés
│   ├── useAuth.ts
│   ├── useGeocoding.ts
│   └── useImageAnalysis.ts
├── lib/                # Configuration et utilitaires
│   └── supabase.ts
├── pages/              # Pages de l'application
│   ├── HomePage.tsx
│   ├── ReportsPage.tsx
│   ├── ProfilePage.tsx
│   ├── MyAlertsPage.tsx
│   └── EditReportPage.tsx
├── services/           # Services externes
│   ├── gemini.ts
│   └── geocoding.ts
├── store/              # Gestion d'état (Zustand)
│   ├── authStore.ts
│   └── missingPersonsStore.ts
├── types/              # Types TypeScript
│   └── index.ts
├── utils/              # Utilitaires
│   ├── cn.ts
│   ├── errorMessages.ts
│   └── roles.ts
├── App.tsx             # Composant principal
├── main.tsx            # Point d'entrée
└── index.css           # Styles globaux
```

## 🌐 Routes disponibles

| Route | Description | Accès |
|-------|-------------|-------|
| `/` | Page d'accueil avec statistiques | Public |
| `/connexion` | Connexion utilisateur | Public |
| `/inscription` | Inscription utilisateur | Public |
| `/rapports` | Liste des signalements | Authentifié |
| `/rapports/:id` | Détail d'un signalement | Authentifié |
| `/rapports/nouveau` | Nouveau signalement | Authentifié |
| `/rapports/:id/modifier` | Modifier un signalement | Propriétaire |
| `/carte` | Vue carte des disparitions | Authentifié |
| `/profil` | Profil utilisateur | Authentifié |
| `/mes-alertes` | Alertes personnalisées | Authentifié |

## 🔒 Sécurité

### Authentification
- **JWT** avec Supabase Auth
- **Refresh tokens** automatiques
- **Sessions persistantes** sécurisées

### Autorisation
- **Row Level Security (RLS)** activé sur toutes les tables
- **Politiques granulaires** par rôle utilisateur
- **Validation** côté client et serveur

### Protection des données
- **Conformité RGPD** intégrée
- **Consentement explicite** pour le partage d'informations
- **Chiffrement** des données sensibles
- **Protection CSRF** intégrée

## 🚀 Déploiement

### Vercel (recommandé)

1. Connectez votre repo GitHub à [Vercel](https://vercel.com)
2. Ajoutez les variables d'environnement dans les paramètres Vercel
3. Déployez automatiquement

```bash
# Variables d'environnement Vercel
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anonyme-supabase
VITE_GEMINI_API_KEY=votre-cle-api-gemini
```

### Netlify

1. Connectez votre repo à [Netlify](https://netlify.com)
2. Configurez les variables d'environnement
3. Déployez

### Docker (optionnel)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🧪 Tests

```bash
# Tests unitaires (à implémenter)
npm run test

# Tests E2E (à implémenter)
npm run test:e2e

# Linting
npm run lint
```

## 📈 Performance

- **Bundle size** optimisé avec Vite
- **Code splitting** automatique
- **Lazy loading** des composants
- **Images optimisées** avec compression
- **Cache** intelligent des données

## 🤝 Contribution

### Workflow de contribution

1. **Fork** le projet
2. Créez une branche pour votre fonctionnalité :
   ```bash
   git checkout -b feature/nouvelle-fonctionnalite
   ```
3. Committez vos changements :
   ```bash
   git commit -m 'feat: ajouter nouvelle fonctionnalité'
   ```
4. Push vers la branche :
   ```bash
   git push origin feature/nouvelle-fonctionnalite
   ```
5. Ouvrez une **Pull Request**

### Standards de code

- **TypeScript** strict
- **ESLint** + **Prettier**
- **Conventional Commits**
- **Tests** obligatoires pour les nouvelles fonctionnalités
- **Documentation** des APIs publiques

### Règles de commit

```bash
feat: nouvelle fonctionnalité
fix: correction de bug
docs: documentation
style: formatage
refactor: refactoring
test: tests
chore: tâches de maintenance
```

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

### Documentation
- [Guide d'architecture](ARCHITECTURE.md)
- [Documentation API](API_DOCS.md)
- [Schéma de base de données](DB_SCHEMA.md)
- [Guide de contribution](CONTRIBUTING.md)
- [Roadmap](ROADMAP.md)

### Support technique
- **Issues GitHub** pour les bugs et demandes de fonctionnalités
- **Discussions GitHub** pour les questions générales
- **Email** : support@alertdisparu.fr

## 🔄 Mises à jour

### Mise à jour des dépendances

```bash
# Vérifier les mises à jour disponibles
npm outdated

# Mettre à jour toutes les dépendances
npm update

# Mettre à jour une dépendance spécifique
npm install package@latest
```

### Changelog

Voir [CHANGELOG.md](CHANGELOG.md) pour l'historique des versions.

---

**AlertDisparu** - Faire la différence dans la recherche de personnes disparues 🚨