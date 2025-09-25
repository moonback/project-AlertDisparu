# Guide d'Utilisation - Mes Alertes

Ce guide explique comment utiliser le composant "Mes Alertes" pour gérer vos signalements de disparitions.

## 🎯 Fonctionnalités Principales

### 1. **Vue d'ensemble de vos signalements**
- Statistiques en temps réel (Total, Actifs, Retrouvés, Fermés, Urgences)
- Liste complète de tous vos signalements
- Informations détaillées pour chaque cas

### 2. **Filtrage et Recherche**
- **Recherche textuelle** : Par nom, prénom ou localisation
- **Filtre par statut** : Actif, Retrouvé, Fermé
- **Filtre par type de cas** : Disparition, Fugue, Enlèvement, etc.
- **Filtre par priorité** : Faible, Moyenne, Élevée, Critique
- **Filtre urgence** : Afficher uniquement les cas d'urgence

### 3. **Actions CRUD Complètes**

#### **Créer un nouveau signalement**
- Bouton "Nouveau signalement" en haut de la page
- Redirection vers le formulaire de création
- Support de tous les types de cas et informations détaillées

#### **Consulter un signalement**
- Bouton "Voir" sur chaque carte de signalement
- Accès à la page de détail complète
- Informations étendues selon le type de cas

#### **Modifier un signalement**
- Bouton "Modifier" sur chaque carte
- Formulaire pré-rempli avec les données existantes
- Possibilité de modifier tous les champs
- Sauvegarde automatique des modifications

#### **Supprimer un signalement**
- Bouton "Supprimer" avec confirmation
- Modal de confirmation pour éviter les suppressions accidentelles
- Suppression définitive et irréversible

### 4. **Actions Rapides**
- **Marquer comme retrouvé** : Pour les cas actifs
- **Fermer le dossier** : Pour les cas résolus
- Changement de statut en un clic

## 🔧 Utilisation Détaillée

### **Accès à Mes Alertes**
1. **Via le menu principal** : Cliquez sur "Mes Alertes" dans la navigation
2. **Via le menu utilisateur** : Cliquez sur votre avatar → "Mes Alertes"
3. **URL directe** : `/mes-alertes`

### **Navigation dans vos signalements**

#### **Statistiques**
Les cartes en haut affichent :
- **Total** : Nombre total de signalements créés
- **Actifs** : Signalements en cours de recherche
- **Retrouvés** : Personnes retrouvées
- **Fermés** : Dossiers fermés
- **Urgences** : Cas nécessitant une attention immédiate

#### **Filtres**
1. **Recherche textuelle** : Tapez dans la barre de recherche
2. **Filtres déroulants** : Sélectionnez le statut et le type de cas
3. **Case urgence** : Cochez pour voir uniquement les cas d'urgence
4. **Effacer les filtres** : Bouton pour réinitialiser tous les filtres

### **Gestion des Signalements**

#### **Créer un Nouveau Signalement**
1. Cliquez sur "Nouveau signalement"
2. Remplissez le formulaire complet
3. Sélectionnez le type de cas approprié
4. Ajoutez toutes les informations disponibles
5. Sauvegardez le signalement

#### **Modifier un Signalement Existant**
1. Cliquez sur "Modifier" sur la carte du signalement
2. Le formulaire s'ouvre avec les données existantes
3. Modifiez les champs nécessaires
4. Cliquez sur "Sauvegarder les modifications"

#### **Changer le Statut Rapidement**
Pour les signalements actifs :
- **"Marquer comme retrouvé"** : Si la personne a été retrouvée
- **"Fermer le dossier"** : Si le cas est résolu ou clos

#### **Supprimer un Signalement**
1. Cliquez sur "Supprimer" (bouton rouge)
2. Confirmez dans la modal qui s'ouvre
3. Le signalement est définitivement supprimé

## 📊 Informations Affichées

### **Carte de Signalement**
Chaque signalement affiche :
- **Photo** : Photo de la personne (si disponible)
- **Nom complet** : Prénom et nom
- **Badges** : Type de cas, priorité, urgence, statut
- **Informations de base** : Âge, genre, localisation
- **Date de disparition** : Quand la personne a disparu
- **Durée** : Nombre de jours depuis la disparition
- **Actions** : Boutons Voir, Modifier, Supprimer

### **Types de Cas Supportés**
- **Disparition générale** : Cas standard
- **Fugue** : Mineur qui s'enfuit volontairement
- **Enlèvement** : Enlèvement forcé (priorité critique)
- **Adulte disparu** : Personne majeure disparue
- **Enfant disparu** : Mineur disparu (priorité élevée)

### **Niveaux de Priorité**
- **Faible** : Cas non urgents
- **Moyenne** : Cas standard (par défaut)
- **Élevée** : Cas nécessitant une attention particulière
- **Critique** : Urgences absolues

## 🔒 Sécurité et Permissions

### **Contrôle d'Accès**
- Seuls vos propres signalements sont visibles
- Vous ne pouvez modifier/supprimer que vos signalements
- Authentification requise pour accéder à la page

### **Protection des Données**
- Confirmation obligatoire pour la suppression
- Sauvegarde automatique des modifications
- Validation des données avant sauvegarde

## 🚨 Cas d'Urgence

### **Identification Automatique**
Les cas sont automatiquement marqués comme urgents si :
- Enfant de moins de 18 ans en fugue ou enlèvement
- Enfant de moins de 13 ans disparu
- Tout cas d'enlèvement

### **Actions Recommandées**
Pour les cas d'urgence :
1. Vérifiez que toutes les informations sont complètes
2. Contactez immédiatement les autorités
3. Partagez le signalement sur les réseaux sociaux
4. Surveillez les mises à jour régulièrement

## 📱 Interface Responsive

### **Desktop**
- Vue en grille avec cartes détaillées
- Filtres en ligne
- Actions visibles sur chaque carte

### **Mobile**
- Vue en liste compacte
- Filtres empilés
- Actions dans un menu déroulant

## 🔄 Synchronisation

### **Temps Réel**
- Les modifications sont sauvegardées immédiatement
- Les statistiques se mettent à jour automatiquement
- Pas besoin de recharger la page

### **Gestion des Erreurs**
- Messages d'erreur clairs en cas de problème
- Retry automatique pour les opérations réseau
- Sauvegarde locale des modifications en cours

## 💡 Conseils d'Utilisation

### **Bonnes Pratiques**
1. **Complétez tous les champs** : Plus d'informations = meilleures chances de retrouver
2. **Mettez à jour régulièrement** : Ajoutez de nouvelles informations si disponibles
3. **Changez le statut** : Marquez comme retrouvé dès que possible
4. **Supprimez les doublons** : Évitez les signalements multiples pour la même personne

### **Optimisation**
1. **Utilisez les filtres** : Pour trouver rapidement un signalement spécifique
2. **Surveillez les urgences** : Vérifiez régulièrement les cas critiques
3. **Gardez les informations à jour** : Modifiez les détails si nécessaire

## 🆘 Support

En cas de problème :
1. Vérifiez votre connexion internet
2. Rechargez la page
3. Contactez le support technique
4. Consultez les logs de la console pour plus de détails

---

**Note** : Ce composant est intégré à votre système de gestion des disparitions et fonctionne avec tous les types de cas supportés par votre application.
