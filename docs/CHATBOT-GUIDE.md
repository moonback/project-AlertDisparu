# Guide du Chatbot IA - AlertDisparu

## Vue d'ensemble

Le chatbot flottant d'AlertDisparu est un assistant IA intelligent alimenté par Google Gemini qui a accès complet à votre base de données. Il peut analyser les signalements, observations, scénarios de résolution et fournir des insights en temps réel.

## 🚀 Fonctionnalités principales

### 1. **Accès complet aux données**
- **Signalements** : Tous les cas de personnes disparues (actifs, fermés, trouvés)
- **Observations** : Toutes les observations d'investigation avec leurs métadonnées
- **Scénarios de résolution** : Scénarios générés par l'IA pour chaque cas
- **Statistiques** : Analyses en temps réel des tendances et patterns

### 2. **Interface intuitive**
- **Bouton flottant** : Accessible depuis n'importe quelle page
- **Interface responsive** : S'adapte à tous les écrans
- **Suggestions rapides** : Boutons prédéfinis pour les actions courantes
- **Données en temps réel** : Insights actualisés automatiquement

### 3. **Capacités d'analyse**
- **Analyse de signalements** : Évaluation des priorités et urgences
- **Évaluation de crédibilité** : Analyse des témoins et observations
- **Génération de scénarios** : Propositions de résolution de cas
- **Statistiques avancées** : Patterns temporels et géographiques

## 🎯 Utilisation

### Accès au chatbot
1. Cliquez sur le bouton bleu flottant en bas à droite de l'écran
2. Le chatbot s'ouvre avec un message d'accueil personnalisé
3. Vous pouvez commencer à taper votre question ou utiliser les suggestions

### Suggestions rapides
Le chatbot propose plusieurs suggestions prédéfinies :

#### 🔍 **Analyser les signalements actifs**
```
"Peux-tu me donner un résumé des signalements actifs et leurs priorités ?"
```
- Affiche tous les cas actifs
- Analyse les priorités (faible, moyen, élevé, critique)
- Identifie les urgences

#### 📊 **Statistiques des observations**
```
"Montre-moi les statistiques des observations récentes et les tendances"
```
- Nombre total d'observations
- Observations vérifiées vs non vérifiées
- Patterns temporels (heures de pointe, jours de la semaine)
- Distribution géographique

#### 👥 **Évaluer la crédibilité des témoins**
```
"Analyse la crédibilité des témoins et leurs observations"
```
- Score de crédibilité pour chaque témoin
- Facteurs d'évaluation (cohérence, vérification, qualité des détails)
- Tendances d'amélioration ou de déclin
- Recommandations d'actions

#### 🎯 **Actions suggérées**
```
"Quelles actions me suggères-tu pour améliorer les investigations ?"
```
- Actions prioritaires basées sur les données actuelles
- Recommandations personnalisées selon le rôle utilisateur
- Suggestions de coordination et de suivi

#### 🧠 **Générer des scénarios**
```
"Peux-tu générer des scénarios de résolution pour les cas prioritaires ?"
```
- 2 scénarios par cas avec probabilités
- Actions concrètes à entreprendre
- Ressources nécessaires
- Timeline estimée

#### 🚨 **Cas d'urgence**
```
"Y a-t-il des cas d'urgence qui nécessitent une attention immédiate ?"
```
- Identification des cas critiques
- Alertes prioritaires
- Actions d'urgence recommandées

### Données en temps réel

Le chatbot affiche des **insights en temps réel** :

#### 📈 **Cartes de données**
- **Signalements actifs** : Nombre total de cas en cours
- **Observations récentes** : Activité des 7 derniers jours
- **Observations vérifiées** : Témoignages confirmés par les autorités
- **Haute priorité** : Cas nécessitant une attention immédiate

#### 🏙️ **Top villes d'observation**
- Classement des villes avec le plus d'observations
- Nombre d'observations par ville
- Identification des zones d'activité

#### ⚡ **Actions suggérées automatiques**
- **Cas d'urgence** : Alertes pour les situations critiques
- **Vérifications en retard** : Rappels pour les observations non vérifiées
- **Analyse de tendances** : Suggestions d'analyse lors de forte activité

## 💡 Exemples d'utilisation

### Pour les familles
```
"Mon frère a disparu il y a 3 jours. Que puis-je faire pour aider à le retrouver ?"
```
→ Le chatbot analysera les cas similaires et suggérera des actions

### Pour les autorités
```
"Donne-moi un rapport complet sur l'activité de cette semaine"
```
→ Rapport détaillé avec statistiques et recommandations

### Pour les bénévoles
```
"Quels sont les cas où j'ai le plus de chances d'aider ?"
```
→ Analyse des cas selon la localisation et les besoins

## 🔧 Configuration

### Prérequis
- Clé API Gemini configurée (`VITE_GEMINI_API_KEY`)
- Base de données Supabase fonctionnelle
- Utilisateur authentifié

### Variables d'environnement
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎨 Interface utilisateur

### Éléments de l'interface

#### Header
- **Icône Bot** : Identifie l'assistant IA
- **Nom utilisateur** : Affiche le rôle (famille, autorité, bénévole)
- **Boutons d'action** :
  - 💡 **Suggestions** : Affiche les suggestions rapides
  - 📊 **Données** : Montre les insights en temps réel
  - ➖ **Réduire** : Minimise la fenêtre
  - ❌ **Fermer** : Ferme le chatbot

#### Zone de messages
- **Messages utilisateur** : Bulles bleues alignées à droite
- **Réponses IA** : Bulles grises alignées à gauche avec icône bot
- **Indicateur de frappe** : Animation pendant que l'IA réfléchit
- **Horodatage** : Heure d'envoi de chaque message

#### Zone de saisie
- **Champ de texte** : Saisie libre des questions
- **Bouton d'envoi** : Envoie le message (Enter fonctionne aussi)
- **Actions rapides** : Boutons pour suggestions et données
- **Bouton d'effacement** : Vide l'historique de conversation

### Interactions

#### Raccourcis clavier
- **Enter** : Envoie le message
- **Shift + Enter** : Nouvelle ligne (pour les messages longs)

#### Actions de la souris
- **Clic sur suggestion** : Insère automatiquement la question
- **Clic sur insight** : Génère une question basée sur les données
- **Hover sur message** : Affiche le bouton de copie

## 🔒 Sécurité et confidentialité

### Protection des données
- **Authentification requise** : Seuls les utilisateurs connectés peuvent utiliser le chatbot
- **Contrôle d'accès** : Les données affichées respectent les politiques RLS
- **Historique local** : Les conversations ne sont pas stockées en base
- **Pas de logs** : Les questions sensibles ne sont pas enregistrées

### Respect de la vie privée
- **Anonymisation** : Les noms des personnes disparues sont protégés
- **Consentement** : Respect des consentements donnés lors des signalements
- **Minimisation** : Seules les données nécessaires sont transmises à l'IA

## 🚀 Améliorations futures

### Fonctionnalités planifiées
- **Recherche vocale** : Possibilité de parler au lieu de taper
- **Notifications push** : Alertes pour les cas urgents
- **Intégration mobile** : Application mobile dédiée
- **Multi-langues** : Support d'autres langues
- **Analytics avancées** : Tableaux de bord personnalisés

### Optimisations techniques
- **Cache intelligent** : Mise en cache des réponses fréquentes
- **Streaming** : Réponses en temps réel (type ChatGPT)
- **Offline mode** : Fonctionnement hors ligne limité
- **Performance** : Optimisation des requêtes de base de données

## 🆘 Dépannage

### Problèmes courants

#### Le chatbot ne s'affiche pas
1. Vérifiez que `VITE_GEMINI_API_KEY` est configurée
2. Assurez-vous d'être connecté à l'application
3. Vérifiez la console pour les erreurs JavaScript

#### L'IA ne répond pas correctement
1. Vérifiez votre connexion internet
2. Vérifiez que la clé API Gemini est valide
3. Essayez de reformuler votre question

#### Les données ne s'affichent pas
1. Vérifiez votre connexion à Supabase
2. Assurez-vous d'avoir les permissions nécessaires
3. Vérifiez que la base de données contient des données

#### Performance lente
1. Videz l'historique de conversation
2. Fermez et rouvrez le chatbot
3. Vérifiez votre connexion internet

### Support
Pour toute question ou problème :
- Consultez les logs de la console navigateur
- Vérifiez les erreurs réseau dans l'onglet Network
- Contactez l'administrateur système

---

*Le chatbot AlertDisparu est conçu pour vous accompagner dans vos investigations de manière intelligente et sécurisée. N'hésitez pas à explorer toutes ses fonctionnalités !*
