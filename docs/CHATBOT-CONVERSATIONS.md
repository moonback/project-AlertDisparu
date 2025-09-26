# Système de Conversations Multiples - Chatbot AlertDisparu

## Vue d'ensemble

Le chatbot AlertDisparu a été amélioré pour supporter **plusieurs conversations actives** avec sauvegarde complète en base de données. Chaque utilisateur peut maintenant gérer plusieurs conversations simultanément et retrouver l'historique complet de ses échanges.

## 🚀 Nouvelles Fonctionnalités

### 1. **Conversations multiples**
- **Création illimitée** : Chaque utilisateur peut créer autant de conversations qu'il le souhaite
- **Sauvegarde automatique** : Tous les messages sont sauvegardés en base de données
- **Historique complet** : Accès à toutes les conversations passées
- **Titres automatiques** : Génération intelligente de titres basés sur le premier message

### 2. **Interface de gestion**
- **Liste des conversations** : Vue d'ensemble de toutes les conversations
- **Recherche rapide** : Navigation facile entre les conversations
- **Actions contextuelles** : Renommer, supprimer, créer de nouvelles conversations
- **Indicateurs visuels** : Dernier message, nombre de messages, date de mise à jour

### 3. **Sauvegarde persistante**
- **Base de données** : Toutes les conversations sont stockées en PostgreSQL
- **Sécurité** : Row Level Security (RLS) pour protéger les données
- **Performance** : Index optimisés pour des requêtes rapides
- **Intégrité** : Contraintes et triggers pour maintenir la cohérence

## 📊 Structure de la Base de Données

### Tables créées

#### `chatbot_conversations`
```sql
- id (uuid) : Identifiant unique de la conversation
- user_id (uuid) : Référence vers l'utilisateur propriétaire
- title (text) : Titre de la conversation
- created_at (timestamp) : Date de création
- updated_at (timestamp) : Dernière mise à jour
- is_active (boolean) : Conversation active ou non
- last_message_at (timestamp) : Dernier message reçu
```

#### `chatbot_messages`
```sql
- id (uuid) : Identifiant unique du message
- conversation_id (uuid) : Référence vers la conversation
- role (text) : 'user' ou 'assistant'
- content (text) : Contenu du message
- metadata (jsonb) : Métadonnées supplémentaires
- created_at (timestamp) : Date de création
- message_order (integer) : Ordre dans la conversation
```

### Fonctions PostgreSQL

#### `get_user_conversations_with_last_message(user_uuid)`
Retourne toutes les conversations d'un utilisateur avec le dernier message et les statistiques.

#### `get_conversation_messages(conv_id, user_uuid)`
Retourne tous les messages d'une conversation spécifique.

#### `create_new_conversation(user_uuid, title)`
Crée une nouvelle conversation pour un utilisateur.

#### `add_message_to_conversation(conv_id, role, content, metadata, user_uuid)`
Ajoute un message à une conversation existante.

## 🎯 Utilisation

### Accès aux conversations

1. **Bouton Conversations** : Cliquez sur l'icône 💬 dans l'en-tête du chatbot
2. **Liste des conversations** : Toutes vos conversations s'affichent avec :
   - Titre de la conversation
   - Aperçu du dernier message
   - Nombre de messages
   - Date de dernière activité

### Créer une nouvelle conversation

1. **Bouton Nouvelle** : Cliquez sur le bouton ➕ dans la liste des conversations
2. **Création automatique** : Une nouvelle conversation est créée automatiquement
3. **Titre généré** : Le titre est généré automatiquement à partir du premier message

### Gérer les conversations existantes

#### Modifier le titre
1. Cliquez sur l'icône ✏️ à côté d'une conversation
2. Modifiez le titre directement
3. Validez avec ✅ ou annulez avec ❌

#### Supprimer une conversation
1. Cliquez sur l'icône 🗑️ à côté d'une conversation
2. Confirmez la suppression
3. La conversation et tous ses messages sont supprimés définitivement

### Navigation entre conversations

1. **Sélection** : Cliquez sur une conversation pour la charger
2. **Chargement automatique** : Tous les messages s'affichent instantanément
3. **Continuation** : Vous pouvez continuer la conversation où vous l'aviez laissée

## 🔧 API du Service

### Méthodes principales

```typescript
// Obtenir toutes les conversations
const conversations = await chatbotService.getUserConversations();

// Charger une conversation existante
const messages = await chatbotService.loadConversation(conversationId);

// Créer une nouvelle conversation
const newId = await chatbotService.createConversation('Mon titre');

// Changer de conversation active
await chatbotService.setActiveConversation(conversationId);

// Mettre à jour le titre
await chatbotService.updateConversationTitle(conversationId, 'Nouveau titre');

// Supprimer une conversation
await chatbotService.deleteConversation(conversationId);
```

### Gestion automatique

- **Sauvegarde automatique** : Chaque message est automatiquement sauvegardé
- **Titre intelligent** : Génération automatique du titre au premier message
- **Ordre des messages** : Maintien de l'ordre chronologique
- **Métadonnées** : Support des données supplémentaires par message

## 🔒 Sécurité

### Row Level Security (RLS)

- **Isolation des utilisateurs** : Chaque utilisateur ne voit que ses propres conversations
- **Autorités** : Les utilisateurs avec le rôle 'authority' peuvent voir toutes les conversations
- **Suppression en cascade** : Suppression automatique des messages lors de la suppression d'une conversation

### Politiques de sécurité

```sql
-- Les utilisateurs peuvent voir leurs propres conversations
CREATE POLICY "Users can view their own conversations" ON chatbot_conversations
    FOR SELECT USING (auth.uid() = user_id);

-- Les autorités peuvent voir toutes les conversations
CREATE POLICY "Authorities can view all conversations" ON chatbot_conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'authority'
        )
    );
```

## 📈 Performance

### Index optimisés

```sql
-- Index pour les requêtes fréquentes
CREATE INDEX idx_chatbot_conversations_user_id ON chatbot_conversations(user_id);
CREATE INDEX idx_chatbot_conversations_active ON chatbot_conversations(user_id, is_active);
CREATE INDEX idx_chatbot_messages_conversation_id ON chatbot_messages(conversation_id);
CREATE INDEX idx_chatbot_messages_order ON chatbot_messages(conversation_id, message_order);
```

### Optimisations

- **Pagination** : Chargement progressif des messages
- **Cache** : Mise en cache des conversations récentes
- **Requêtes optimisées** : Utilisation de fonctions PostgreSQL pour de meilleures performances

## 🎨 Interface Utilisateur

### Composants créés

#### `ConversationList`
- Liste complète des conversations
- Actions de gestion (créer, modifier, supprimer)
- Indicateurs visuels (statut, dernière activité)
- Interface responsive

#### `FloatingChatbot` (mis à jour)
- Intégration de la gestion des conversations
- Boutons de navigation entre les modes
- Sauvegarde automatique des messages
- Gestion des états de conversation

### Navigation

1. **💬 Conversations** : Vue de toutes les conversations
2. **💡 Suggestions** : Suggestions rapides pour démarrer
3. **📊 Données** : Insights en temps réel
4. **💬 Messages** : Vue de la conversation active

## 🔄 Migration

### Installation

1. **Exécuter le script SQL** :
   ```bash
   psql -d votre_base -f supabase/chatbot-conversations.sql
   ```

2. **Vérifier les permissions** : S'assurer que les politiques RLS sont actives

3. **Tester la connexion** : Vérifier que les fonctions PostgreSQL fonctionnent

### Compatibilité

- **Rétrocompatible** : Les anciennes fonctionnalités restent inchangées
- **Migration automatique** : Pas de migration de données nécessaire
- **Nouvelle installation** : Fonctionne directement sur une nouvelle base

## 🚀 Avantages

### Pour les utilisateurs
- **Organisation** : Gestion claire de multiples sujets d'investigation
- **Continuité** : Reprendre les conversations à tout moment
- **Historique** : Accès à tous les échanges passés
- **Flexibilité** : Créer autant de conversations que nécessaire

### Pour les développeurs
- **Architecture robuste** : Structure de base de données bien conçue
- **API claire** : Méthodes simples et intuitives
- **Sécurité** : Protection des données utilisateur
- **Performance** : Requêtes optimisées et index appropriés

### Pour les administrateurs
- **Monitoring** : Suivi des conversations et de l'utilisation
- **Sécurité** : Contrôle d'accès granulaire
- **Maintenance** : Structure facile à maintenir et étendre

## 📋 Exemples d'utilisation

### Scénario 1 : Investigation multi-cas
```
1. Conversation "Cas Marie Dupont - Enquête principale"
2. Conversation "Piste véhicule blanc - Investigation"
3. Conversation "Témoins à contacter - Coordination"
4. Conversation "Analyse des observations - Synthèse"
```

### Scénario 2 : Formation et apprentissage
```
1. Conversation "Formation - Analyse des signalements"
2. Conversation "Questions techniques - Support"
3. Conversation "Bonnes pratiques - Discussion"
```

### Scénario 3 : Coordination d'équipe
```
1. Conversation "Réunion équipe - Points d'action"
2. Conversation "Planification recherches - Organisation"
3. Conversation "Suivi quotidien - Rapports"
```

---

*Le système de conversations multiples transforme le chatbot AlertDisparu en un véritable outil de gestion d'investigation, permettant aux utilisateurs d'organiser efficacement leurs échanges et de maintenir un historique complet de leurs interactions.*
