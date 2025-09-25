# Guide de déploiement - Scénarios de résolution en base de données

## 🎯 Objectif

Ce guide explique comment déployer la fonctionnalité de scénarios de résolution avec persistance en base de données.

## 📋 Prérequis

- Accès à l'interface Supabase
- Clé API Gemini configurée
- Base de données Supabase opérationnelle

## 🗄️ Étapes de déploiement

### 1. Créer la table des scénarios de résolution

Exécutez le script SQL suivant dans l'interface Supabase (onglet SQL Editor) :

```sql
-- Script de création de la table pour les scénarios de résolution générés par l'IA

-- Créer la table des scénarios de résolution
CREATE TABLE IF NOT EXISTS resolution_scenarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    missing_person_id UUID NOT NULL REFERENCES missing_persons(id) ON DELETE CASCADE,
    
    -- Scénario 1
    scenario1_title TEXT NOT NULL,
    scenario1_description TEXT NOT NULL,
    scenario1_probability TEXT NOT NULL CHECK (scenario1_probability IN ('low', 'medium', 'high')),
    scenario1_actions TEXT[] NOT NULL DEFAULT '{}',
    scenario1_timeline TEXT NOT NULL,
    scenario1_key_factors TEXT[] NOT NULL DEFAULT '{}',
    scenario1_resources TEXT[] NOT NULL DEFAULT '{}',
    
    -- Scénario 2
    scenario2_title TEXT NOT NULL,
    scenario2_description TEXT NOT NULL,
    scenario2_probability TEXT NOT NULL CHECK (scenario2_probability IN ('low', 'medium', 'high')),
    scenario2_actions TEXT[] NOT NULL DEFAULT '{}',
    scenario2_timeline TEXT NOT NULL,
    scenario2_key_factors TEXT[] NOT NULL DEFAULT '{}',
    scenario2_resources TEXT[] NOT NULL DEFAULT '{}',
    
    -- Résumé et recommandations générales
    summary TEXT NOT NULL,
    recommendations TEXT[] NOT NULL DEFAULT '{}',
    
    -- Métadonnées de génération
    generation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ai_model_used TEXT DEFAULT 'gemini-1.5-flash',
    generation_version TEXT DEFAULT '1.0',
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_resolution_scenarios_missing_person ON resolution_scenarios(missing_person_id);
CREATE INDEX IF NOT EXISTS idx_resolution_scenarios_generation_date ON resolution_scenarios(generation_date);
CREATE INDEX IF NOT EXISTS idx_resolution_scenarios_created_by ON resolution_scenarios(created_by);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_resolution_scenarios_updated_at 
    BEFORE UPDATE ON resolution_scenarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activer RLS sur la table
ALTER TABLE resolution_scenarios ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les scénarios de résolution

-- Les créateurs peuvent voir leurs scénarios générés
CREATE POLICY "Les créateurs peuvent voir leurs scénarios" ON resolution_scenarios
    FOR SELECT USING (auth.uid() = created_by);

-- Les utilisateurs authentifiés peuvent créer des scénarios
CREATE POLICY "Les utilisateurs authentifiés peuvent créer des scénarios" ON resolution_scenarios
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Les créateurs peuvent mettre à jour leurs scénarios
CREATE POLICY "Les créateurs peuvent mettre à jour leurs scénarios" ON resolution_scenarios
    FOR UPDATE USING (auth.uid() = created_by);

-- Les créateurs peuvent supprimer leurs scénarios
CREATE POLICY "Les créateurs peuvent supprimer leurs scénarios" ON resolution_scenarios
    FOR DELETE USING (auth.uid() = created_by);

-- Les autorités peuvent voir tous les scénarios
CREATE POLICY "Les autorités peuvent voir tous les scénarios" ON resolution_scenarios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'authority'
        )
    );

-- Les autorités peuvent mettre à jour tous les scénarios
CREATE POLICY "Les autorités peuvent mettre à jour tous les scénarios" ON resolution_scenarios
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'authority'
        )
    );
```

### 2. Vérifier la création de la table

Après l'exécution du script, vérifiez que la table a été créée :

```sql
-- Vérifier que la table existe
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'resolution_scenarios' 
ORDER BY ordinal_position;
```

### 3. Tester les politiques RLS

Vérifiez que les politiques de sécurité sont actives :

```sql
-- Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'resolution_scenarios';
```

## 🔧 Configuration de l'application

### 1. Variables d'environnement

Assurez-vous que les variables suivantes sont configurées :

```env
# Clé API Gemini (obligatoire)
VITE_GEMINI_API_KEY=votre_cle_api_gemini_ici

# Configuration Supabase (déjà configurée)
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

### 2. Redémarrage de l'application

Après avoir appliqué les changements de base de données :

```bash
# Arrêter le serveur de développement
Ctrl+C

# Redémarrer le serveur
npm run dev
```

## 🧪 Tests de validation

### 1. Test de génération de scénarios

1. Connectez-vous à l'application
2. Naviguez vers un rapport de personne disparue
3. Cliquez sur "Générer scénarios IA"
4. Vérifiez que les scénarios s'affichent correctement
5. Vérifiez que les scénarios sont sauvegardés en base de données

### 2. Test de persistance

1. Rechargez la page
2. Naviguez vers l'onglet "Scénarios IA"
3. Vérifiez que les scénarios sauvegardés s'affichent
4. Testez la suppression d'un scénario

### 3. Test des permissions

1. Connectez-vous avec un utilisateur différent
2. Vérifiez que vous ne voyez que vos propres scénarios
3. Testez avec un utilisateur ayant le rôle "authority"

## 📊 Monitoring et maintenance

### 1. Requêtes de monitoring

```sql
-- Statistiques des scénarios générés
SELECT 
    DATE(generation_date) as date,
    COUNT(*) as scenarios_generated,
    COUNT(DISTINCT missing_person_id) as unique_reports
FROM resolution_scenarios 
GROUP BY DATE(generation_date)
ORDER BY date DESC;

-- Scénarios par utilisateur
SELECT 
    p.first_name,
    p.last_name,
    p.role,
    COUNT(*) as scenarios_count
FROM resolution_scenarios rs
JOIN profiles p ON rs.created_by = p.id
GROUP BY p.id, p.first_name, p.last_name, p.role
ORDER BY scenarios_count DESC;
```

### 2. Nettoyage des données

```sql
-- Supprimer les scénarios anciens (plus de 6 mois)
DELETE FROM resolution_scenarios 
WHERE generation_date < NOW() - INTERVAL '6 months';

-- Archiver les scénarios pour les rapports fermés
UPDATE resolution_scenarios 
SET ai_model_used = ai_model_used || ' (archived)'
WHERE missing_person_id IN (
    SELECT id FROM missing_persons WHERE status = 'closed'
);
```

## 🚨 Dépannage

### Erreur "Table resolution_scenarios does not exist"

- Vérifiez que le script SQL a été exécuté correctement
- Vérifiez les permissions de votre utilisateur Supabase

### Erreur "Policy violation"

- Vérifiez que les politiques RLS sont correctement configurées
- Vérifiez que l'utilisateur est authentifié

### Erreur "Cannot read properties of null"

- Vérifiez que la clé API Gemini est configurée
- Vérifiez la connexion à la base de données

### Scénarios non sauvegardés

- Vérifiez les logs de la console navigateur
- Vérifiez les permissions RLS pour l'insertion
- Vérifiez la connexion Supabase

## 📈 Optimisations futures

### 1. Cache des scénarios

Implémenter un système de cache pour éviter de régénérer les mêmes scénarios.

### 2. Historique des versions

Ajouter un système de versioning pour suivre l'évolution des scénarios.

### 3. Analytics avancées

Ajouter des métriques sur l'efficacité des scénarios générés.

## ✅ Checklist de déploiement

- [ ] Script SQL exécuté avec succès
- [ ] Table `resolution_scenarios` créée
- [ ] Index créés
- [ ] Politiques RLS configurées
- [ ] Variables d'environnement configurées
- [ ] Application redémarrée
- [ ] Tests de génération réussis
- [ ] Tests de persistance réussis
- [ ] Tests de permissions réussis
- [ ] Monitoring configuré

---

**🎉 Déploiement terminé !**

La fonctionnalité de scénarios de résolution avec persistance en base de données est maintenant opérationnelle.
