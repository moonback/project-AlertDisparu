# Guide de Migration - Extension des Types de Cas

Ce guide explique comment migrer votre application de gestion des disparitions pour supporter différents types de cas (fugues, enlèvements, etc.).

## 🚀 Étapes de Migration

### 1. Mise à jour de la Base de Données

Exécutez le script SQL `extend-case-types.sql` sur votre base de données Supabase :

```sql
-- Ce script ajoute les nouveaux champs nécessaires
-- Voir le fichier extend-case-types.sql pour le script complet
```

### 2. Types de Cas Supportés

- **disappearance** : Disparition générale
- **runaway** : Fugue (mineur qui s'enfuit volontairement)
- **abduction** : Enlèvement (enlèvement forcé)
- **missing_adult** : Adulte disparu
- **missing_child** : Enfant disparu

### 3. Niveaux de Priorité

- **low** : Faible priorité
- **medium** : Priorité moyenne (par défaut)
- **high** : Priorité élevée
- **critical** : Priorité critique (urgences)

### 4. Nouveaux Champs Ajoutés

#### Dans la table `missing_persons` :
- `case_type` : Type de cas (obligatoire)
- `priority` : Priorité du cas (calculée automatiquement)
- `circumstances` : Circonstances spécifiques
- `time_disappeared` : Heure de disparition
- `is_emergency` : Indicateur d'urgence
- `last_contact_date` : Dernière fois contacté
- `clothing_description` : Description des vêtements
- `personal_items` : Objets personnels
- `medical_info` : Informations médicales
- `behavioral_info` : Informations comportementales

### 5. Logique de Priorité Automatique

Le système calcule automatiquement la priorité selon ces règles :

```sql
-- Enfants < 18 ans + fugue/enlèvement = HIGH + URGENCE
-- Enfants < 13 ans + disparition = HIGH + URGENCE  
-- Adultes >= 65 ans + disparition = MEDIUM
-- Enlèvement = CRITICAL + URGENCE
-- Autres cas = MEDIUM
```

### 6. Composants Mis à Jour

#### Nouveaux Composants :
- `CaseTypeBadge` : Affiche le type de cas, priorité et urgence

#### Composants Modifiés :
- `ReportForm` : Ajout des nouveaux champs
- `ReportDetail` : Affichage des informations étendues
- `ReportCard` : Badges pour type de cas et priorité
- `SearchFilters` : Filtres par type, priorité, urgence

### 7. Interface Utilisateur

#### Formulaire de Signalement :
- Sélection du type de cas (obligatoire)
- Heure de disparition (optionnelle)
- Circonstances spécifiques
- Description des vêtements
- Objets personnels
- Informations médicales
- Informations comportementales

#### Filtres de Recherche :
- Filtre par type de cas
- Filtre par priorité
- Filtre par statut
- Case à cocher "Cas d'urgence uniquement"

#### Affichage des Rapports :
- Badges colorés pour le type de cas
- Indicateur de priorité
- Badge "URGENCE" pour les cas critiques
- Informations détaillées dans la vue détaillée

### 8. Politiques de Sécurité (RLS)

Les nouvelles politiques permettent :
- Visibilité publique des cas d'urgence
- Contrôle d'accès basé sur le type de cas
- Protection des informations sensibles

### 9. Migration des Données Existantes

Pour les données existantes :
- `case_type` sera défini sur 'disappearance' par défaut
- `priority` sera calculée automatiquement
- `is_emergency` sera défini selon l'âge et le type

### 10. Tests Recommandés

1. **Test de création** : Créer un rapport avec chaque type de cas
2. **Test de priorité** : Vérifier le calcul automatique des priorités
3. **Test de filtres** : Tester tous les nouveaux filtres
4. **Test d'affichage** : Vérifier les badges et l'affichage
5. **Test de performance** : Vérifier les nouveaux index

### 11. Configuration Post-Migration

1. Vérifiez que tous les nouveaux champs sont visibles
2. Testez la création de rapports avec les nouveaux types
3. Vérifiez que les filtres fonctionnent correctement
4. Assurez-vous que les badges s'affichent bien
5. Testez les politiques RLS

### 12. Support et Maintenance

- Les nouveaux index optimisent les recherches par type et priorité
- La vue `case_type_statistics` fournit des statistiques utiles
- Les triggers automatiques maintiennent la cohérence des données

## ⚠️ Notes Importantes

- Cette migration est **rétrocompatible**
- Les données existantes ne seront pas perdues
- Les nouveaux champs sont optionnels sauf `case_type`
- La priorité est calculée automatiquement mais peut être modifiée manuellement

## 🔧 Dépannage

Si vous rencontrez des problèmes :

1. Vérifiez que le script SQL a été exécuté complètement
2. Assurez-vous que les types TypeScript sont à jour
3. Vérifiez que tous les composants sont importés correctement
4. Consultez les logs de la console pour les erreurs

## 📊 Statistiques Disponibles

Après migration, vous pouvez utiliser la vue `case_type_statistics` pour obtenir :
- Nombre total de cas par type
- Cas actifs vs résolus
- Cas d'urgence par type
- Âge moyen par type de cas
- Dates des cas les plus anciens/récents
