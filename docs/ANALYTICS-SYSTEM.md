# Système d'Analytics et Intelligence des Données

Ce document décrit le système d'analytics et d'intelligence des données implémenté pour analyser les observations d'investigation.

## 🎯 Vue d'ensemble

Le système d'analytics fournit une analyse approfondie des observations d'investigation avec quatre composants principaux :

1. **Timeline Interactive** - Visualisation chronologique des événements
2. **Heatmap Géographique** - Carte de chaleur des zones d'activité
3. **Corrélation Temporelle** - Détection de patterns temporels
4. **Score de Crédibilité** - Évaluation de la fiabilité des témoins

## 📊 Composants du Système

### 1. Timeline Interactive

#### Fonctionnalités
- **Visualisation chronologique** : Affichage des événements par date et heure
- **Filtres interactifs** : Par confiance, vérification, date, observateur
- **Types d'événements** : Observations, vérifications, mises à jour
- **Détails contextuels** : Métadonnées, localisation, photos

#### Données affichées
- Date et heure de l'événement
- Type d'événement (observation/verification/update)
- Niveau de confiance avec code couleur
- Statut de vérification
- Informations de localisation
- Métadonnées du témoin

#### Utilisation
```typescript
<TimelineChart 
  timeline={analyticsData.timeline}
  compact={false}
  filters={filters}
  onFilterChange={handleFilterChange}
/>
```

### 2. Heatmap Géographique

#### Fonctionnalités
- **Intensité visuelle** : Code couleur basé sur le nombre d'observations
- **Tri intelligent** : Par intensité, nombre, ou confiance
- **Statistiques par zone** : Répartition par niveau de confiance
- **Intégration cartographique** : Liens vers Google Maps

#### Métriques calculées
- **Intensité** : Nombre d'observations normalisé (0-1)
- **Concentration** : Nombre total d'observations par zone
- **Confiance moyenne** : Score de confiance par localisation
- **Couverture géographique** : Nombre de zones distinctes

#### Utilisation
```typescript
<HeatmapMap 
  heatmapData={analyticsData.heatmap}
  compact={false}
/>
```

### 3. Corrélation Temporelle

#### Fonctionnalités
- **Analyse par heure** : Patterns d'activité horaire
- **Analyse par jour** : Tendances hebdomadaires
- **Analyse par mois** : Variations saisonnières
- **Métriques multiples** : Nombre, confiance, vérification

#### Patterns détectés
- **Heures de pointe** : Périodes de forte activité
- **Jours actifs** : Tendances hebdomadaires
- **Saisonnalité** : Variations mensuelles
- **Corrélations** : Relations entre différents facteurs

#### Utilisation
```typescript
<TemporalPatternsChart 
  patterns={analyticsData.temporalPatterns}
  compact={false}
/>
```

### 4. Score de Crédibilité

#### Algorithme de calcul
Le score de crédibilité (0-100) est calculé à partir de 5 facteurs :

1. **Cohérence** (25%) : Uniformité des témoignages
2. **Taux de vérification** (25%) : Pourcentage d'observations vérifiées
3. **Qualité des détails** (20%) : Richesse des informations fournies
4. **Temps de réponse** (15%) : Rapidité de réponse aux vérifications
5. **Qualité des photos** (15%) : Présence et qualité des images

#### Facteurs analysés
- **Cohérence** : Analyse des mots-clés communs dans les descriptions
- **Vérification** : Taux de validation par les autorités
- **Détails** : Nombre et qualité des informations supplémentaires
- **Réactivité** : Temps entre observation et vérification
- **Médias** : Présence et pertinence des photos

#### Utilisation
```typescript
<WitnessCredibilityTable 
  witnesses={analyticsData.witnessCredibility}
  compact={false}
/>
```

## 🔧 Architecture Technique

### Service Analytics

Le service `AnalyticsService` centralise toute la logique d'analyse :

```typescript
class AnalyticsService {
  // Récupération des données
  static async getAnalyticsData(query: AnalyticsQuery): Promise<AnalyticsData>
  
  // Construction des analyses
  private static async buildTimeline(observations: InvestigationObservation[])
  private static async buildHeatmap(observations: InvestigationObservation[])
  private static async buildTemporalPatterns(observations: InvestigationObservation[])
  private static async buildWitnessCredibility(observations: InvestigationObservation[])
  private static async buildStatistics(observations: InvestigationObservation[])
}
```

### Types de Données

#### AnalyticsQuery
```typescript
interface AnalyticsQuery {
  missingPersonId: string;
  filters?: AnalyticsFilters;
  timeRange?: 'week' | 'month' | 'quarter' | 'year' | 'all';
}
```

#### AnalyticsData
```typescript
interface AnalyticsData {
  timeline: TimelineEvent[];
  heatmap: HeatmapData[];
  temporalPatterns: TemporalPattern[];
  witnessCredibility: WitnessCredibility[];
  statistics: StatisticsData;
}
```

### Filtres et Requêtes

#### Filtres disponibles
- **Période** : Plage de dates personnalisée
- **Confiance** : Niveaux low/medium/high
- **Vérification** : Statut vérifié/non vérifié
- **Localisation** : Ville, rayon, coordonnées
- **Observateur** : Nom du témoin

#### Requêtes optimisées
- **Indexation** : Index sur les champs fréquemment filtrés
- **Pagination** : Chargement progressif des données
- **Cache** : Mise en cache des résultats fréquents
- **Aggrégation** : Calculs pré-calculés en base

## 📈 Métriques et KPIs

### Métriques Globales
- **Observations totales** : Nombre total d'observations
- **Taux de vérification** : Pourcentage d'observations vérifiées
- **Confiance moyenne** : Score moyen de confiance
- **Couverture géographique** : Nombre de zones couvertes

### Métriques Temporelles
- **Heure de pointe** : Moment de plus forte activité
- **Jour le plus actif** : Jour de la semaine avec le plus d'observations
- **Distribution horaire** : Répartition par période de la journée
- **Tendances** : Évolution dans le temps

### Métriques de Qualité
- **Score de crédibilité moyen** : Fiabilité globale des témoins
- **Témoins fiables** : Nombre de témoins avec score > 70
- **Qualité des détails** : Richesse moyenne des informations
- **Taux de photos** : Pourcentage d'observations avec images

## 🎨 Interface Utilisateur

### Tableau de Bord Principal
- **Navigation par onglets** : Vue d'ensemble, Timeline, Heatmap, Patterns, Crédibilité
- **Contrôles de filtrage** : Période, métriques, vues
- **Export de données** : Téléchargement JSON/PDF
- **Actualisation** : Mise à jour en temps réel

### Responsive Design
- **Desktop** : Interface complète avec tous les détails
- **Tablet** : Adaptation des colonnes et espacements
- **Mobile** : Interface simplifiée et optimisée

### Accessibilité
- **Navigation clavier** : Support complet du clavier
- **Lecteurs d'écran** : Compatible avec les technologies d'assistance
- **Contraste** : Respect des standards d'accessibilité
- **Couleurs** : Code couleur accessible pour daltoniens

## 🔄 Performance et Optimisation

### Optimisations Techniques
- **Lazy Loading** : Chargement progressif des composants
- **Memoization** : Cache des calculs coûteux
- **Virtual Scrolling** : Gestion efficace des grandes listes
- **Debouncing** : Optimisation des interactions utilisateur

### Gestion des Données
- **Pagination** : Chargement par lots pour les grandes datasets
- **Filtrage côté client** : Filtres instantanés sur les données chargées
- **Cache intelligent** : Mise en cache des résultats d'analyse
- **Compression** : Optimisation de la taille des données

### Monitoring
- **Métriques de performance** : Temps de chargement, temps de réponse
- **Analytics d'usage** : Fréquence d'utilisation des fonctionnalités
- **Alertes** : Notifications en cas de problème de performance
- **Logs** : Traçabilité des opérations et erreurs

## 🚀 Utilisation et Intégration

### Intégration dans l'Application
Le système d'analytics est intégré dans le composant `InvestigationObservations` :

```typescript
// Navigation par onglets
const [activeTab, setActiveTab] = useState<'observations' | 'analytics'>('observations');

// Affichage conditionnel
{activeTab === 'analytics' && (
  <AnalyticsDashboard />
)}
```

### API et Services
- **Service Analytics** : Logique métier centralisée
- **Types TypeScript** : Typage strict pour la sécurité
- **Hooks personnalisés** : Réutilisabilité des composants
- **Composants modulaires** : Architecture modulaire et maintenable

### Configuration
- **Variables d'environnement** : Configuration des API externes
- **Paramètres utilisateur** : Préférences personnalisables
- **Thèmes** : Support des thèmes sombre/clair
- **Localisation** : Support multi-langues

## 📚 Exemples d'Utilisation

### Analyse d'un Cas
1. **Accès** : Navigation vers l'onglet "Analytics" d'un cas
2. **Vue d'ensemble** : Consultation des statistiques globales
3. **Timeline** : Analyse chronologique des événements
4. **Heatmap** : Identification des zones d'activité
5. **Patterns** : Détection des tendances temporelles
6. **Crédibilité** : Évaluation de la fiabilité des témoins

### Filtrage et Recherche
```typescript
// Filtrage par période
const filters = {
  dateRange: {
    start: '2024-01-01',
    end: '2024-01-31'
  }
};

// Filtrage par confiance
const filters = {
  confidence: ['high', 'medium']
};

// Filtrage géographique
const filters = {
  location: {
    city: 'Paris',
    radius: 50
  }
};
```

### Export de Données
```typescript
// Export JSON complet
const exportData = () => {
  const dataStr = JSON.stringify(analyticsData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  // Téléchargement...
};
```

## 🔮 Évolutions Futures

### Fonctionnalités Avancées
- **IA Prédictive** : Prédiction des zones probables
- **Détection d'anomalies** : Identification automatique de patterns suspects
- **Corrélation automatique** : Liaison entre cas similaires
- **Alertes intelligentes** : Notifications proactives

### Intégrations Externes
- **Réseaux sociaux** : Monitoring des mentions
- **Bases de données policières** : Vérification automatique
- **Systèmes de transport** : Données de mobilité
- **Météo et trafic** : Contexte environnemental

### Améliorations Techniques
- **Temps réel** : Mise à jour instantanée des données
- **Machine Learning** : Amélioration continue des algorithmes
- **API GraphQL** : Requêtes plus efficaces
- **Microservices** : Architecture distribuée

---

Ce système d'analytics transforme les données brutes d'observations en insights actionnables, facilitant le travail des enquêteurs et améliorant l'efficacité des investigations.
