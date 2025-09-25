# Guide de contribution - AlertDisparu

## 🤝 Bienvenue !

Merci de votre intérêt pour contribuer à AlertDisparu ! Ce projet vise à aider les familles et les autorités dans la recherche de personnes disparues. Votre contribution peut faire la différence.

## 📋 Avant de commencer

### Code de conduite

Nous nous engageons à maintenir un environnement accueillant et respectueux pour tous les contributeurs. Veuillez :

- Être respectueux et bienveillant
- Être ouvert aux différentes perspectives et expériences
- Accepter les critiques constructives
- Se concentrer sur ce qui est le mieux pour la communauté
- Faire preuve d'empathie envers les autres membres

### Types de contributions

Nous accueillons plusieurs types de contributions :

- 🐛 **Rapports de bugs**
- ✨ **Nouvelles fonctionnalités**
- 📚 **Amélioration de la documentation**
- 🎨 **Amélioration de l'interface utilisateur**
- ⚡ **Optimisations de performance**
- 🧪 **Tests et qualité**
- 🌐 **Traductions**

## 🚀 Configuration de l'environnement

### Prérequis

- **Node.js** 18+ ([télécharger](https://nodejs.org/))
- **npm** ou **yarn**
- **Git**
- **Compte Supabase** (gratuit)
- **Clé API Google Gemini** (optionnel)

### Installation

1. **Fork** le repository sur GitHub
2. **Clone** votre fork localement :

```bash
git clone https://github.com/votre-username/alertdisparu.git
cd alertdisparu
```

3. **Installez** les dépendances :

```bash
npm install
```

4. **Configurez** les variables d'environnement :

```bash
cp .env.example .env
# Éditez .env avec vos clés Supabase
```

5. **Configurez** Supabase :

```bash
# Exécutez les scripts SQL dans l'ordre :
# 1. supabase/supabase-setup.sql
# 2. supabase/extend-case-types.sql
# 3. supabase/investigation-observations.sql
```

6. **Lancez** l'application :

```bash
npm run dev
```

## 🔧 Workflow de développement

### 1. Créer une branche

```bash
# Synchronisez avec le repository principal
git remote add upstream https://github.com/original-repo/alertdisparu.git
git fetch upstream
git checkout main
git merge upstream/main

# Créez une nouvelle branche pour votre fonctionnalité
git checkout -b feature/nom-de-votre-fonctionnalite
```

### 2. Développer votre fonctionnalité

- **Écrivez du code** propre et bien documenté
- **Suivez** les conventions de nommage existantes
- **Ajoutez des tests** pour votre code
- **Vérifiez** que tous les tests passent

### 3. Tests et qualité

```bash
# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e

# Linting
npm run lint

# Formatage
npm run format

# Vérification TypeScript
npm run type-check
```

### 4. Commit et push

```bash
# Ajoutez vos fichiers
git add .

# Committez avec un message descriptif
git commit -m "feat: ajouter fonctionnalité de recherche avancée"

# Push vers votre fork
git push origin feature/nom-de-votre-fonctionnalite
```

### 5. Créer une Pull Request

1. Allez sur GitHub et cliquez sur **"New Pull Request"**
2. Sélectionnez votre branche
3. Remplissez le template de PR
4. Attendez la review

## 📝 Standards de code

### TypeScript

- **Types stricts** activés
- **Interfaces** pour tous les objets complexes
- **Pas de `any`** sauf cas exceptionnels
- **Documentation JSDoc** pour les fonctions publiques

```typescript
/**
 * Calcule la distance entre deux points géographiques
 * @param coord1 - Premier point
 * @param coord2 - Deuxième point
 * @returns Distance en kilomètres
 */
export const calculateDistance = (
  coord1: Coordinates,
  coord2: Coordinates
): number => {
  // Implémentation...
}
```

### React

- **Composants fonctionnels** avec hooks
- **Props typées** avec interfaces
- **Hooks personnalisés** pour la logique réutilisable
- **Memoization** appropriée (`useMemo`, `useCallback`)

```typescript
interface ReportCardProps {
  report: MissingPerson;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onEdit,
  onDelete
}) => {
  // Implémentation...
};
```

### CSS/Styling

- **Tailwind CSS** pour le styling
- **Classes utilitaires** privilégiées
- **Composants réutilisables** dans `src/components/ui/`
- **Design system** cohérent

```typescript
// ✅ Bon
<Button variant="primary" size="lg" className="w-full">
  Créer un signalement
</Button>

// ❌ Mauvais
<button className="bg-red-500 text-white px-4 py-2 rounded">
  Créer un signalement
</button>
```

### Gestion d'état

- **Zustand** pour l'état global
- **Hooks locaux** pour l'état des composants
- **Actions typées** dans les stores
- **Gestion d'erreur** appropriée

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<Result>;
  logout: () => Promise<void>;
}
```

## 🧪 Tests

### Tests unitaires

- **Couverture** > 80%
- **Tests** pour tous les utilitaires
- **Mocks** appropriés pour les services externes
- **Tests** des cas d'erreur

```typescript
describe('calculateDistance', () => {
  it('should calculate distance correctly', () => {
    const coord1 = { lat: 48.8566, lng: 2.3522 }; // Paris
    const coord2 = { lat: 45.7640, lng: 4.8357 }; // Lyon
    
    const distance = calculateDistance(coord1, coord2);
    expect(distance).toBeCloseTo(392.8, 1);
  });
});
```

### Tests d'intégration

- **Tests** des flux complets
- **Tests** de l'API Supabase
- **Tests** des composants avec données réelles
- **Tests** de performance

### Tests E2E

- **Parcours utilisateur** complets
- **Tests** sur différents navigateurs
- **Tests** responsive
- **Tests** d'accessibilité

## 📚 Documentation

### Code

- **Commentaires** pour la logique complexe
- **JSDoc** pour les fonctions publiques
- **README** pour chaque module complexe
- **Exemples** d'utilisation

### API

- **Documentation** des endpoints
- **Exemples** de requêtes/réponses
- **Codes d'erreur** documentés
- **Schémas** de validation

### Utilisateur

- **Guides** étape par étape
- **FAQ** fréquentes
- **Vidéos** de démonstration
- **Screenshots** pour les interfaces

## 🐛 Rapporter un bug

### Template de bug report

```markdown
**Description du bug**
Une description claire et concise du problème.

**Étapes pour reproduire**
1. Aller à '...'
2. Cliquer sur '...'
3. Voir l'erreur

**Comportement attendu**
Ce qui devrait se passer.

**Comportement actuel**
Ce qui se passe réellement.

**Screenshots**
Si applicable, ajoutez des captures d'écran.

**Environnement**
- OS: [ex. Windows 10]
- Navigateur: [ex. Chrome 91]
- Version: [ex. 0.2.1]

**Informations supplémentaires**
Tout autre contexte utile.
```

### Critères de qualité

- **Reproductible** : Le bug peut être reproduit
- **Spécifique** : Le problème est bien défini
- **Unique** : Pas de doublon existant
- **Priorisé** : Impact sur les utilisateurs évalué

## ✨ Proposer une fonctionnalité

### Template de feature request

```markdown
**Description de la fonctionnalité**
Une description claire et concise de la fonctionnalité souhaitée.

**Problème résolu**
Quel problème cette fonctionnalité résoudrait-elle ?

**Solution proposée**
Comment imaginez-vous cette fonctionnalité ?

**Alternatives considérées**
D'autres solutions que vous avez envisagées.

**Contexte supplémentaire**
Tout autre contexte ou screenshots.
```

### Critères d'acceptation

- **Utilité** : Résout un vrai problème utilisateur
- **Faisabilité** : Techniquement réalisable
- **Alignement** : Correspond à la vision du produit
- **Priorité** : Impact vs effort évalué

## 🔍 Processus de review

### Pour les contributeurs

1. **Attendez** les commentaires des reviewers
2. **Répondez** aux questions et suggestions
3. **Apportez** les modifications demandées
4. **Testez** vos changements
5. **Mettez à jour** la documentation si nécessaire

### Pour les reviewers

1. **Vérifiez** la qualité du code
2. **Testez** les fonctionnalités
3. **Vérifiez** la documentation
4. **Donnez** des retours constructifs
5. **Approuvez** si tout est correct

### Critères de review

- **Fonctionnalité** : Le code fait ce qu'il doit faire
- **Qualité** : Code propre et maintenable
- **Tests** : Couverture appropriée
- **Performance** : Pas de régression
- **Sécurité** : Pas de vulnérabilités
- **Documentation** : À jour et claire

## 🚀 Déploiement

### Branches

- **`main`** : Version stable en production
- **`develop`** : Version de développement
- **`feature/*`** : Nouvelles fonctionnalités
- **`hotfix/*`** : Corrections urgentes

### Processus de release

1. **Merge** vers `main`
2. **Tests** automatisés
3. **Build** de production
4. **Déploiement** automatique
5. **Notification** des changements

## 📞 Support et communication

### Canaux de communication

- **GitHub Issues** : Bugs et fonctionnalités
- **GitHub Discussions** : Questions générales
- **Discord** : Chat en temps réel (à créer)
- **Email** : contact@alertdisparu.fr

### Réponse aux questions

- **Issues** : Réponse sous 48h
- **Discussions** : Réponse sous 24h
- **Discord** : Réponse en temps réel
- **Email** : Réponse sous 72h

## 🏆 Reconnaissance

### Types de reconnaissance

- **Contributeurs** listés dans le README
- **Badges** GitHub pour les contributions
- **Mentions** dans les releases
- **Certificats** pour les contributions majeures

### Critères de reconnaissance

- **Qualité** des contributions
- **Fréquence** des contributions
- **Impact** sur le projet
- **Engagement** communautaire

## 📄 Licence

En contribuant à AlertDisparu, vous acceptez que vos contributions soient sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

Merci à tous les contributeurs qui rendent ce projet possible ! Votre engagement aide à faire la différence dans la recherche de personnes disparues.

---

**Ensemble, nous pouvons sauver des vies !** 🚨❤️
