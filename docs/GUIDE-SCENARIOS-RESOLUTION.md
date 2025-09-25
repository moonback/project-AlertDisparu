# Guide d'utilisation - Génération de scénarios de résolution par IA

## Vue d'ensemble

Cette fonctionnalité utilise l'API Gemini pour générer automatiquement 2 scénarios de résolution possibles pour chaque cas de personne disparue. L'IA analyse toutes les informations disponibles dans la base de données pour proposer des scénarios réalistes et des actions concrètes.

## Fonctionnalités

### 🧠 Génération intelligente de scénarios
- Analyse complète de tous les éléments du rapport
- Intégration de toutes les observations et témoignages
- Génération de 2 scénarios différents et complémentaires
- Évaluation de la probabilité de chaque scénario

### 📊 Informations analysées
L'IA prend en compte :
- **Informations de base** : nom, âge, genre, type de cas
- **Circonstances** : date/heure de disparition, lieu, description
- **Détails physiques** : vêtements, objets personnels, informations médicales
- **Observations** : tous les témoignages et observations enregistrés
- **Statistiques** : nombre d'observations, niveau de confiance, distances

### 🎯 Contenu des scénarios
Chaque scénario généré contient :
- **Titre** : nom descriptif du scénario
- **Description** : explication détaillée de ce qui pourrait s'être passé
- **Probabilité** : évaluation (faible/moyenne/élevée)
- **Actions recommandées** : liste d'actions concrètes à entreprendre
- **Timeline** : estimation du temps nécessaire
- **Facteurs clés** : éléments importants à considérer
- **Ressources nécessaires** : moyens et personnes à mobiliser

## Comment utiliser

### 1. Accéder à un rapport
- Naviguez vers la page des rapports
- Cliquez sur un rapport pour voir les détails

### 2. Générer les scénarios
- Dans la page de détail du rapport, cliquez sur le bouton **"Générer scénarios IA"**
- L'IA analysera toutes les informations disponibles
- Les scénarios apparaîtront automatiquement dans l'onglet "Scénarios IA"

### 3. Consulter les résultats
- **Onglet "Scénarios IA"** : affiche les 2 scénarios générés
- **Résumé de l'analyse** : vue d'ensemble des perspectives
- **Recommandations générales** : actions prioritaires à entreprendre

### 4. Actions disponibles
- **Réessayer** : si la génération échoue, vous pouvez relancer
- **Fermer** : retourner aux détails du rapport
- **Partager** : les scénarios peuvent être discutés avec l'équipe

## Configuration requise

### Clé API Gemini
- Ajoutez `VITE_GEMINI_API_KEY` dans votre fichier `.env`
- Obtenez votre clé sur [Google AI Studio](https://makersuite.google.com/app/apikey)

### Exemple de configuration
```env
VITE_GEMINI_API_KEY=votre_cle_api_gemini_ici
```

## Exemples de scénarios générés

### Scénario 1 : Recherche active
- **Probabilité** : Élevée
- **Description** : Recherche coordonnée avec les autorités
- **Actions** : Mobiliser les bénévoles, diffuser l'information, coordonner avec la police
- **Timeline** : 1-2 semaines

### Scénario 2 : Retour volontaire
- **Probabilité** : Faible
- **Description** : Retour spontané de la personne disparue
- **Actions** : Maintenir les canaux ouverts, surveiller les réseaux sociaux
- **Timeline** : Variable

## Bonnes pratiques

### ✅ Recommandations
- Consultez toujours les autorités compétentes
- Utilisez les scénarios comme suggestions, pas comme conclusions
- Partagez les résultats avec l'équipe d'investigation
- Mettez à jour les informations si de nouveaux éléments apparaissent

### ⚠️ Limitations
- Les scénarios sont générés par une IA et doivent être validés
- Ils se basent uniquement sur les informations disponibles
- La probabilité est estimée, pas garantie
- Consultez toujours les professionnels pour les actions importantes

## Dépannage

### Erreur "Clé API non configurée"
- Vérifiez que `VITE_GEMINI_API_KEY` est définie dans `.env`
- Redémarrez le serveur de développement après modification

### Erreur de génération
- Vérifiez votre connexion internet
- Assurez-vous que la clé API est valide
- Réessayez en cliquant sur "Réessayer"

### Scénarios peu pertinents
- Vérifiez que le rapport contient suffisamment d'informations
- Ajoutez des observations détaillées si nécessaire
- Les scénarios s'améliorent avec plus de données

## Support technique

Pour toute question ou problème :
1. Vérifiez la configuration de l'API Gemini
2. Consultez les logs de la console navigateur
3. Contactez l'équipe technique si nécessaire

---

*Cette fonctionnalité utilise l'API Gemini de Google pour générer des scénarios de résolution basés sur l'analyse intelligente des données disponibles.*
