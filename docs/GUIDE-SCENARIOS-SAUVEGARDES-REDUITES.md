# Guide - Scénarios sauvegardés réduits par défaut

## 🎯 Fonctionnalité implémentée

Les **scénarios sauvegardés** sont maintenant **complètement réduits par défaut** avec un système de réduction à deux niveaux pour une navigation optimale.

## ✨ Nouveautés

### 🔽 Réduction complète par défaut
- **Vue d'ensemble** : Résumé concis de chaque scénario sauvegardé
- **Informations clés** : Date de génération, nombre de recommandations, modèle IA
- **Description tronquée** : Premiers 200 caractères avec "..." si plus long
- **Badges informatifs** : Métadonnées essentielles visibles

### 🔼 Expansion à deux niveaux
- **Niveau 1** : Développer le contenu général (scénarios + résumé + recommandations)
- **Niveau 2** : Développer chaque scénario individuellement
- **Contrôle indépendant** : Chaque niveau peut être étendu/réduit séparément
- **État persistant** : Maintient l'état pendant la session

## 🎨 Interface utilisateur

### Mode réduit (par défaut)
```
┌─────────────────────────────────────────────────────────┐
│ 📅 Généré le 15/01/2024                    [Développer] │
│ Modèle: gemini-1.5-flash • Version: 1.0               │
├─────────────────────────────────────────────────────────┤
│ Analyse basée sur les informations disponibles dans    │
│ la base de données. Les scénarios proposent des         │
│ approches différentes pour résoudre le cas...          │
│                                                         │
│ [📅 15/01/2024] [✅ 3 recommandations] [💡 gemini-1.5-flash] │
└─────────────────────────────────────────────────────────┘
```

### Mode étendu (niveau 1)
```
┌─────────────────────────────────────────────────────────┐
│ 📅 Généré le 15/01/2024                        [Réduire] │
│ Modèle: gemini-1.5-flash • Version: 1.0               │
├─────────────────────────────────────────────────────────┤
│ 💡 Scénario de recherche active    [Élevée] [Développer] │
│ Recherche coordonnée avec les autorités locales...      │
│ [🕐 1-2 semaines] [🎯 3 actions] [👥 3 ressources]     │
│                                                         │
│ 💡 Scénario de retour volontaire   [Faible] [Développer] │
│ Retour spontané de la personne disparue...             │
│ [🕐 Variable] [🎯 2 actions] [👥 2 ressources]          │
│                                                         │
│ 📊 Résumé de l'analyse                                  │
│ Analyse complète basée sur toutes les données...        │
│                                                         │
│ ✅ Recommandations générales                            │
│ ✓ Continuer les investigations                          │
│ ✓ Maintenir la coordination                             │
│ ✓ Suivre toutes les pistes                              │
└─────────────────────────────────────────────────────────┘
```

### Mode étendu (niveau 2 - scénario individuel)
```
┌─────────────────────────────────────────────────────────┐
│ 💡 Scénario de recherche active    [Élevée] [Réduire]   │
├─────────────────────────────────────────────────────────┤
│ Description du scénario                                 │
│ Recherche coordonnée avec les autorités locales et     │
│ mobilisation des bénévoles pour une recherche efficace  │
│ dans un rayon de 50km autour du lieu de disparition.    │
│                                                         │
│ 🕐 Timeline estimée: 1-2 semaines                      │
│                                                         │
│ 🎯 Actions recommandées:                               │
│ ✓ Coordonner avec les forces de l'ordre                │
│ ✓ Mobiliser les bénévoles pour la recherche             │
│ ✓ Diffuser l'information via les médias                │
│                                                         │
│ 📈 Facteurs clés: [Coopération] [Mobilisation] [Médias] │
│                                                         │
│ 👥 Ressources: [Forces de l'ordre] [Bénévoles] [Médias] │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Fonctionnement technique

### États de gestion
- **`expandedSavedScenarios`** : Set des éléments étendus
- **Identifiants uniques** :
  - `${scenarioId}-content` : Contenu général
  - `${scenarioId}-1` : Scénario 1 individuel
  - `${scenarioId}-2` : Scénario 2 individuel

### Fonctions de contrôle
- **`toggleSavedScenario()`** : Basculer l'état de n'importe quel élément
- **Contrôle indépendant** : Chaque niveau géré séparément
- **État persistant** : Maintient l'état pendant la session

## 📱 Responsive design

### Mobile
- **Boutons compacts** : "Dév." / "Réduire" pour économiser l'espace
- **Badges empilés** : Informations clés sur plusieurs lignes
- **Texte adapté** : Taille de police optimisée

### Desktop
- **Boutons complets** : "Développer" / "Réduire" avec icônes
- **Badges en ligne** : Informations clés sur une seule ligne
- **Espacement généreux** : Meilleure lisibilité

## 🎯 Avantages

### Pour l'utilisateur
- **Vue d'ensemble rapide** : Comprendre tous les scénarios en un coup d'œil
- **Navigation granulaire** : Contrôle précis de l'affichage
- **Moins de scroll** : Interface ultra-compacte par défaut
- **Focus sur l'essentiel** : Informations clés immédiatement visibles

### Pour l'interface
- **Performance optimale** : Minimum de DOM à rendre par défaut
- **Chargement instantané** : Contenu réduit par défaut
- **UX personnalisable** : Contrôle utilisateur total
- **Design cohérent** : Pattern uniforme dans toute l'application

## 🔄 Comportement par défaut

### Scénarios sauvegardés
- **État initial** : Tous réduits (niveau 0)
- **Expansion niveau 1** : Affiche les scénarios + résumé + recommandations
- **Expansion niveau 2** : Affiche le contenu détaillé d'un scénario
- **Persistance** : État maintenu pendant la session

### Hiérarchie d'affichage
```
Scénarios sauvegardés (réduits par défaut)
├── Résumé tronqué (200 caractères)
├── Badges informatifs (date, recommandations, modèle)
└── Bouton "Développer"

    ↓ (Clic sur "Développer")

Scénarios sauvegardés (niveau 1)
├── Scénario 1 (réduit)
├── Scénario 2 (réduit)
├── Résumé complet
├── Recommandations complètes
└── Bouton "Réduire"

    ↓ (Clic sur "Développer" d'un scénario)

Scénario individuel (niveau 2)
├── Description complète
├── Timeline détaillée
├── Actions recommandées
├── Facteurs clés
├── Ressources nécessaires
└── Bouton "Réduire"
```

## 🎨 Personnalisation visuelle

### Couleurs et icônes
- **Bouton développer** : ChevronDown (bleu)
- **Bouton réduire** : ChevronUp (bleu)
- **Badges informatifs** : Couleurs cohérentes avec le thème
- **États visuels** : Transitions fluides

### Espacement et typographie
- **Mode réduit** : Espacement ultra-compact
- **Mode étendu** : Espacement généreux
- **Texte tronqué** : Taille réduite avec ellipses
- **Badges** : Taille petite pour l'économie d'espace

## 🧪 Tests et validation

### Cas de test
- [x] Affichage réduit par défaut
- [x] Expansion niveau 1 fonctionnelle
- [x] Expansion niveau 2 fonctionnelle
- [x] Réduction fonctionnelle à tous les niveaux
- [x] État persistant pendant la session
- [x] Indépendance entre niveaux
- [x] Responsive design
- [x] Accessibilité des boutons

### Validation utilisateur
- [x] Interface intuitive
- [x] Navigation granulaire
- [x] Performance optimale
- [x] Lisibilité maximale

## 🚀 Déploiement

### Aucune configuration requise
- **Fonctionnalité native** : Intégrée dans le composant
- **Pas de migration** : Compatible avec les données existantes
- **Rétrocompatibilité** : Fonctionne avec tous les scénarios

### Variables d'environnement
- **Aucune nouvelle variable** : Utilise la configuration existante
- **Pas de base de données** : Logique purement frontend

## 📋 Checklist de validation

### Fonctionnalités de base
- [x] Scénarios sauvegardés réduits par défaut
- [x] Expansion niveau 1 (contenu général)
- [x] Expansion niveau 2 (scénarios individuels)
- [x] Réduction fonctionnelle à tous les niveaux
- [x] État persistant pendant la session
- [x] Indépendance entre niveaux

### Interface utilisateur
- [x] Design cohérent avec le reste de l'application
- [x] Icônes intuitives (ChevronDown/ChevronUp)
- [x] Badges informatifs en mode réduit
- [x] Responsive design
- [x] Hiérarchie visuelle claire

### Performance
- [x] Chargement ultra-rapide
- [x] Minimum de DOM à rendre
- [x] Transitions fluides
- [x] Pas d'impact sur les performances

---

**✅ Fonctionnalité déployée !**

Les scénarios sauvegardés sont maintenant complètement réduits par défaut avec un système de réduction à deux niveaux, offrant une expérience utilisateur optimale avec une vue d'ensemble ultra-rapide et un contrôle granulaire de l'affichage.
