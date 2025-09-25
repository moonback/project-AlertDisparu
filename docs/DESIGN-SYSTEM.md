# Design System AlertDisparu

## Vue d'ensemble

Le design system d'AlertDisparu est une collection de composants UI cohérents et réutilisables, conçus pour créer une expérience utilisateur moderne et accessible. Il suit les principes du mobile-first design et respecte les standards de conformité RGPD.

## Principes de Design

### 1. Mobile-First
- Tous les composants sont optimisés pour les appareils mobiles en premier
- Adaptation progressive vers les écrans plus grands (tablette, desktop)
- Navigation tactile intuitive

### 2. Accessibilité
- Contraste élevé pour une meilleure lisibilité
- Support des lecteurs d'écran
- Navigation au clavier complète
- Indicateurs visuels clairs

### 3. Cohérence Visuelle
- Palette de couleurs unifiée
- Typographie cohérente (Inter)
- Espacements harmonieux
- Animations subtiles et fluides

## Palette de Couleurs

### Couleurs Principales
- **Primary (Rouge)**: `#dc2626` - Actions principales, alertes importantes
- **Amber**: `#d97706` - Avertissements, notifications
- **Gray**: `#6b7280` - Texte secondaire, bordures

### Couleurs de Statut
- **Success**: `#16a34a` - Succès, retrouvé
- **Error**: `#dc2626` - Erreurs, disparu
- **Warning**: `#d97706` - Avertissements
- **Info**: `#2563eb` - Informations

## Typographie

### Police Principale
- **Inter**: Police moderne et lisible
- Poids disponibles: 300, 400, 500, 600, 700, 800

### Hiérarchie
- **H1**: `text-5xl font-bold` - Titres principaux
- **H2**: `text-3xl font-bold` - Sections importantes
- **H3**: `text-xl font-semibold` - Sous-sections
- **Body**: `text-sm` - Contenu principal
- **Caption**: `text-xs` - Métadonnées

## Composants UI

### Button
Composant de bouton polyvalent avec plusieurs variantes et tailles.

```tsx
<Button variant="primary" size="lg" leftIcon={<Icon />}>
  Action principale
</Button>
```

**Variantes**: `primary`, `secondary`, `outline`, `ghost`, `warning`
**Tailles**: `xs`, `sm`, `md`, `lg`, `xl`

### Input
Champ de saisie avec validation et états visuels.

```tsx
<Input
  label="Email"
  type="email"
  leftIcon={<Mail />}
  showPasswordToggle={true}
  error={errorMessage}
/>
```

### Card
Conteneur flexible pour organiser le contenu.

```tsx
<Card variant="elevated" interactive>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
  </CardHeader>
  <CardContent>Contenu</CardContent>
</Card>
```

**Variantes**: `default`, `elevated`, `outlined`, `flat`

### Badge
Indicateur de statut compact.

```tsx
<Badge variant="success" size="md">
  Actif
</Badge>
```

### Alert
Messages d'état avec icônes contextuelles.

```tsx
<Alert variant="error" title="Erreur">
  Message d'erreur détaillé
</Alert>
```

### Modal
Dialogue modal avec overlay.

```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Titre">
  Contenu du modal
</Modal>
```

### LoadingSpinner
Indicateur de chargement avec variantes.

```tsx
<LoadingSpinner variant="dots" size="lg" text="Chargement..." />
```

## Animations

### Transitions
- **Durée**: 200ms pour les interactions, 300ms pour les changements d'état
- **Easing**: `ease-out` pour les entrées, `ease-in` pour les sorties

### Animations CSS
- `animate-fade-in`: Apparition en fondu
- `animate-slide-up`: Glissement vers le haut
- `animate-scale-in`: Zoom d'entrée
- `animate-pulse`: Pulsation pour les indicateurs

## Responsive Design

### Breakpoints
- **Mobile**: `< 768px`
- **Tablet**: `768px - 1024px`
- **Desktop**: `> 1024px`

### Grille
- **Mobile**: 1 colonne
- **Tablet**: 2 colonnes
- **Desktop**: 3+ colonnes

## Accessibilité

### Contraste
- Ratio minimum de 4.5:1 pour le texte normal
- Ratio minimum de 3:1 pour le texte large

### Navigation
- Support complet du clavier
- Indicateurs de focus visibles
- Ordre de tabulation logique

### Sémantique
- Utilisation correcte des balises HTML
- Attributs ARIA appropriés
- Labels associés aux contrôles

## Utilisation

### Installation
```bash
# Les composants sont déjà intégrés dans le projet
import { Button, Input, Card } from './components/ui';
```

### Personnalisation
Les composants utilisent Tailwind CSS et peuvent être personnalisés via les classes CSS ou les props.

### Thème
Le thème peut être modifié dans `tailwind.config.js` pour adapter les couleurs et les espacements.

## Bonnes Pratiques

1. **Cohérence**: Utilisez toujours les composants du design system
2. **Accessibilité**: Testez avec des lecteurs d'écran
3. **Performance**: Évitez les animations excessives
4. **Mobile**: Testez sur de vrais appareils mobiles
5. **Contraste**: Vérifiez le contraste des couleurs

## Contribution

Pour ajouter de nouveaux composants ou modifier les existants :

1. Respectez les conventions de nommage
2. Ajoutez la documentation
3. Testez l'accessibilité
4. Vérifiez la responsivité
5. Mettez à jour ce guide

## Ressources

- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Inter Font](https://rsms.me/inter/)
