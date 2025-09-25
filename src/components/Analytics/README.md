# Composants Analytics - Guide d'Utilisation

## 🎯 Vue d'ensemble

Les composants Analytics fournissent une interface complète pour analyser les observations d'investigation avec des visualisations interactives et des métriques intelligentes.

## 📦 Composants Disponibles

### AnalyticsDashboard
Composant principal qui orchestre tous les autres composants d'analytics.

```tsx
import { AnalyticsDashboard } from '../Analytics';

<AnalyticsDashboard />
```

**Props :**
- `className?: string` - Classes CSS supplémentaires

### TimelineChart
Visualisation chronologique interactive des événements.

```tsx
import { TimelineChart } from '../Analytics';

<TimelineChart 
  timeline={analyticsData.timeline}
  compact={false}
  filters={filters}
  onFilterChange={handleFilterChange}
/>
```

**Props :**
- `timeline: TimelineEvent[]` - Liste des événements
- `compact?: boolean` - Mode compact (défaut: false)
- `filters?: AnalyticsFilters` - Filtres actuels
- `onFilterChange?: (filters: Partial<AnalyticsFilters>) => void` - Callback de changement de filtre

### HeatmapMap
Carte thermique géographique des observations.

```tsx
import { HeatmapMap } from '../Analytics';

<HeatmapMap 
  heatmapData={analyticsData.heatmap}
  compact={false}
/>
```

**Props :**
- `heatmapData: HeatmapData[]` - Données de la carte thermique
- `compact?: boolean` - Mode compact (défaut: false)

### TemporalPatternsChart
Analyse des patterns temporels et tendances.

```tsx
import { TemporalPatternsChart } from '../Analytics';

<TemporalPatternsChart 
  patterns={analyticsData.temporalPatterns}
  compact={false}
/>
```

**Props :**
- `patterns: TemporalPattern[]` - Patterns temporels
- `compact?: boolean` - Mode compact (défaut: false)

### WitnessCredibilityTable
Tableau d'évaluation de la crédibilité des témoins.

```tsx
import { WitnessCredibilityTable } from '../Analytics';

<WitnessCredibilityTable 
  witnesses={analyticsData.witnessCredibility}
  compact={false}
/>
```

**Props :**
- `witnesses: WitnessCredibility[]` - Liste des témoins
- `compact?: boolean` - Mode compact (défaut: false)

### StatisticsCards
Cartes de statistiques globales.

```tsx
import { StatisticsCards } from '../Analytics';

<StatisticsCards 
  statistics={analyticsData.statistics}
/>
```

**Props :**
- `statistics: StatisticsData` - Données statistiques

## 🔧 Utilisation Complète

### Exemple d'intégration dans une page

```tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AnalyticsDashboard } from '../components/Analytics';
import { AnalyticsService } from '../services/analytics';

const InvestigationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const data = await AnalyticsService.getAnalyticsData({
          missingPersonId: id,
          timeRange: 'all'
        });
        setAnalyticsData(data);
      } catch (error) {
        console.error('Erreur lors du chargement des analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [id]);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!analyticsData) {
    return <div>Aucune donnée disponible</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <AnalyticsDashboard />
    </div>
  );
};
```

### Filtrage et Recherche

```tsx
const [filters, setFilters] = useState<AnalyticsFilters>({});

const handleFilterChange = (newFilters: Partial<AnalyticsFilters>) => {
  setFilters(prev => ({ ...prev, ...newFilters }));
};

// Filtrage par période
const timeFilters = {
  dateRange: {
    start: '2024-01-01',
    end: '2024-01-31'
  }
};

// Filtrage par confiance
const confidenceFilters = {
  confidence: ['high', 'medium'] as const
};

// Filtrage géographique
const locationFilters = {
  location: {
    city: 'Paris',
    radius: 50,
    center: { lat: 48.8566, lng: 2.3522 }
  }
};
```

### Export de Données

```tsx
const exportToJSON = (data: AnalyticsData) => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

const exportToPDF = (data: AnalyticsData) => {
  // Implémentation PDF avec une librairie comme jsPDF
  // Voir la documentation de la librairie choisie
};
```

## 🎨 Personnalisation

### Thèmes et Styles

Les composants utilisent les classes Tailwind CSS et peuvent être personnalisés via les props `className`.

```tsx
<AnalyticsDashboard className="custom-analytics-dashboard" />
<TimelineChart className="custom-timeline" />
```

### Couleurs et Indicateurs

Les couleurs sont définies dans le système de design et peuvent être personnalisées :

- **Confiance élevée** : Vert (`text-green-600`, `bg-green-500`)
- **Confiance moyenne** : Jaune (`text-yellow-600`, `bg-yellow-500`)
- **Confiance faible** : Rouge (`text-red-600`, `bg-red-500`)
- **Vérifié** : Bleu (`text-blue-600`, `bg-blue-500`)

### Responsive Design

Tous les composants sont responsives et s'adaptent automatiquement :

- **Desktop** : Interface complète
- **Tablet** : Adaptation des colonnes
- **Mobile** : Mode compact automatique

## 🔍 Debugging et Développement

### Logs et Monitoring

```tsx
// Activer les logs détaillés
const DEBUG_ANALYTICS = process.env.NODE_ENV === 'development';

if (DEBUG_ANALYTICS) {
  console.log('Analytics data:', analyticsData);
  console.log('Filters applied:', filters);
}
```

### Tests et Validation

```tsx
// Validation des données
const validateAnalyticsData = (data: AnalyticsData): boolean => {
  return (
    Array.isArray(data.timeline) &&
    Array.isArray(data.heatmap) &&
    Array.isArray(data.temporalPatterns) &&
    Array.isArray(data.witnessCredibility) &&
    typeof data.statistics === 'object'
  );
};

// Test des composants
import { render, screen } from '@testing-library/react';
import { AnalyticsDashboard } from '../Analytics';

test('renders analytics dashboard', () => {
  render(<AnalyticsDashboard />);
  expect(screen.getByText('Tableau de Bord Analytique')).toBeInTheDocument();
});
```

## 📚 Ressources et Documentation

- [Documentation complète](./ANALYTICS-SYSTEM.md)
- [Types TypeScript](../types/analytics.ts)
- [Service Analytics](../services/analytics.ts)
- [Exemples d'utilisation](../examples/analytics-examples.tsx)

## 🚀 Prochaines Étapes

1. **Intégration** : Ajouter le tableau de bord à vos pages d'investigation
2. **Personnalisation** : Adapter les styles et couleurs à votre design
3. **Données** : Connecter à votre source de données d'observations
4. **Tests** : Implémenter des tests unitaires et d'intégration
5. **Optimisation** : Ajuster les performances selon vos besoins
