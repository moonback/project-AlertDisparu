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

-- Commentaires sur la table
COMMENT ON TABLE resolution_scenarios IS 'Stockage des scénarios de résolution générés par l''IA pour chaque cas de personne disparue';
COMMENT ON COLUMN resolution_scenarios.scenario1_title IS 'Titre du premier scénario de résolution';
COMMENT ON COLUMN resolution_scenarios.scenario1_description IS 'Description détaillée du premier scénario';
COMMENT ON COLUMN resolution_scenarios.scenario1_probability IS 'Probabilité du premier scénario (low, medium, high)';
COMMENT ON COLUMN resolution_scenarios.scenario1_actions IS 'Actions recommandées pour le premier scénario';
COMMENT ON COLUMN resolution_scenarios.scenario1_timeline IS 'Timeline estimée pour le premier scénario';
COMMENT ON COLUMN resolution_scenarios.scenario1_key_factors IS 'Facteurs clés du premier scénario';
COMMENT ON COLUMN resolution_scenarios.scenario1_resources IS 'Ressources nécessaires pour le premier scénario';
COMMENT ON COLUMN resolution_scenarios.scenario2_title IS 'Titre du deuxième scénario de résolution';
COMMENT ON COLUMN resolution_scenarios.scenario2_description IS 'Description détaillée du deuxième scénario';
COMMENT ON COLUMN resolution_scenarios.scenario2_probability IS 'Probabilité du deuxième scénario (low, medium, high)';
COMMENT ON COLUMN resolution_scenarios.scenario2_actions IS 'Actions recommandées pour le deuxième scénario';
COMMENT ON COLUMN resolution_scenarios.scenario2_timeline IS 'Timeline estimée pour le deuxième scénario';
COMMENT ON COLUMN resolution_scenarios.scenario2_key_factors IS 'Facteurs clés du deuxième scénario';
COMMENT ON COLUMN resolution_scenarios.scenario2_resources IS 'Ressources nécessaires pour le deuxième scénario';
COMMENT ON COLUMN resolution_scenarios.summary IS 'Résumé général de l''analyse des scénarios';
COMMENT ON COLUMN resolution_scenarios.recommendations IS 'Recommandations générales pour l''équipe';
COMMENT ON COLUMN resolution_scenarios.generation_date IS 'Date et heure de génération des scénarios';
COMMENT ON COLUMN resolution_scenarios.ai_model_used IS 'Modèle d''IA utilisé pour la génération';
COMMENT ON COLUMN resolution_scenarios.generation_version IS 'Version du système de génération';
