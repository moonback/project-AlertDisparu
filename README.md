# AlertDisparu - Plateforme de recherche de personnes disparues

Une application React moderne pour signaler et rechercher des personnes disparues, avec authentification Supabase et interface en français.

## 🚀 Fonctionnalités

- **Authentification sécurisée** avec Supabase
- **Interface en français** complète
- **Signalement de disparitions** avec géolocalisation
- **Recherche et filtres** avancés
- **Carte interactive** pour visualiser les disparitions
- **Conformité RGPD** intégrée
- **Responsive design** avec Tailwind CSS

## 🛠️ Installation

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd safe-find
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Supabase

1. Créez un nouveau projet sur [Supabase](https://supabase.com)
2. Dans le tableau de bord Supabase, allez dans l'éditeur SQL
3. Exécutez le contenu du fichier `supabase-setup.sql`
4. Récupérez votre URL et clé anonyme dans les paramètres du projet

### 4. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anonyme-supabase
```

### 5. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 📁 Structure du projet

```
src/
├── components/          # Composants React
│   ├── Auth/           # Formulaires d'authentification
│   ├── Layout/         # Composants de mise en page
│   ├── Map/            # Composants de carte
│   ├── Reports/        # Composants de signalements
│   └── ui/             # Composants UI réutilisables
├── lib/                # Configuration Supabase
├── pages/              # Pages de l'application
├── store/              # Gestion d'état (Zustand)
├── types/              # Types TypeScript
└── utils/              # Utilitaires
```

## 🔧 Technologies utilisées

- **React 18** avec TypeScript
- **Vite** pour le build
- **Tailwind CSS** pour le styling
- **Supabase** pour l'authentification et la base de données
- **Zustand** pour la gestion d'état
- **React Hook Form** avec validation Zod
- **React Router** pour la navigation
- **Leaflet** pour les cartes

## 🎯 Rôles utilisateurs

L'application supporte trois types d'utilisateurs :

- **Membre de la famille** : Peut signaler des disparitions
- **Forces de l'ordre** : Accès privilégié aux informations
- **Bénévole** : Peut aider dans les recherches

## 📱 Routes disponibles

- `/` - Page d'accueil
- `/connexion` - Connexion utilisateur
- `/inscription` - Inscription utilisateur
- `/rapports` - Liste des signalements
- `/rapports/:id` - Détail d'un signalement
- `/signalement` - Nouveau signalement
- `/carte` - Vue carte des disparitions

## 🔒 Sécurité

- Authentification JWT avec Supabase
- Row Level Security (RLS) activé
- Validation des données côté client et serveur
- Protection CSRF intégrée
- Conformité RGPD

## 🚀 Déploiement

### Vercel (recommandé)

1. Connectez votre repo GitHub à Vercel
2. Ajoutez les variables d'environnement dans les paramètres Vercel
3. Déployez automatiquement

### Netlify

1. Connectez votre repo à Netlify
2. Configurez les variables d'environnement
3. Déployez

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajouter nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème, ouvrez une issue sur GitHub.

## 🔄 Mises à jour

Pour mettre à jour le projet :

```bash
npm update
```

Vérifiez la compatibilité des dépendances et testez l'application après chaque mise à jour.
