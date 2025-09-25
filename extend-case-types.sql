-- Extension du schéma pour supporter différents types de cas
-- À exécuter après le schéma existant

-- Ajouter une colonne pour le type de cas
ALTER TABLE missing_persons 
ADD COLUMN case_type TEXT NOT NULL DEFAULT 'disappearance' 
CHECK (case_type IN ('disappearance', 'runaway', 'abduction', 'missing_adult', 'missing_child'));

-- Ajouter une colonne pour la priorité du cas
ALTER TABLE missing_persons 
ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium' 
CHECK (priority IN ('low', 'medium', 'high', 'critical'));

-- Ajouter une colonne pour les circonstances spécifiques
ALTER TABLE missing_persons 
ADD COLUMN circumstances TEXT;

-- Ajouter une colonne pour l'heure de disparition (plus précis que juste la date)
ALTER TABLE missing_persons 
ADD COLUMN time_disappeared TIME;

-- Ajouter une colonne pour indiquer si c'est un cas d'urgence
ALTER TABLE missing_persons 
ADD COLUMN is_emergency BOOLEAN NOT NULL DEFAULT false;

-- Ajouter une colonne pour le dernier contact
ALTER TABLE missing_persons 
ADD COLUMN last_contact_date TIMESTAMP WITH TIME ZONE;

-- Ajouter une colonne pour les vêtements portés au moment de la disparition
ALTER TABLE missing_persons 
ADD COLUMN clothing_description TEXT;

-- Ajouter une colonne pour les objets personnels emportés
ALTER TABLE missing_persons 
ADD COLUMN personal_items TEXT;

-- Ajouter une colonne pour les informations médicales importantes
ALTER TABLE missing_persons 
ADD COLUMN medical_info TEXT;

-- Ajouter une colonne pour les informations comportementales
ALTER TABLE missing_persons 
ADD COLUMN behavioral_info TEXT;

-- Créer un index sur le type de cas pour les recherches
CREATE INDEX IF NOT EXISTS idx_missing_persons_case_type ON missing_persons(case_type);
CREATE INDEX IF NOT EXISTS idx_missing_persons_priority ON missing_persons(priority);
CREATE INDEX IF NOT EXISTS idx_missing_persons_emergency ON missing_persons(is_emergency);

-- Mettre à jour les politiques RLS pour inclure les nouveaux champs
-- (Les politiques existantes restent valides)

-- Ajouter une politique pour les cas d'urgence (visibles par tous)
CREATE POLICY "Les cas d'urgence sont visibles par tous" ON missing_persons
    FOR SELECT USING (is_emergency = true OR status = 'active');

-- Fonction pour calculer automatiquement la priorité basée sur l'âge et le type de cas
CREATE OR REPLACE FUNCTION calculate_case_priority()
RETURNS TRIGGER AS $$
BEGIN
    -- Logique de priorité automatique
    IF NEW.age < 18 AND NEW.case_type IN ('abduction', 'runaway') THEN
        NEW.priority = 'high';
        NEW.is_emergency = true;
    ELSIF NEW.age < 13 AND NEW.case_type = 'disappearance' THEN
        NEW.priority = 'high';
        NEW.is_emergency = true;
    ELSIF NEW.age >= 65 AND NEW.case_type = 'disappearance' THEN
        NEW.priority = 'medium';
    ELSIF NEW.case_type = 'abduction' THEN
        NEW.priority = 'critical';
        NEW.is_emergency = true;
    ELSE
        NEW.priority = 'medium';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour calculer automatiquement la priorité
CREATE TRIGGER calculate_priority_trigger
    BEFORE INSERT OR UPDATE ON missing_persons
    FOR EACH ROW EXECUTE FUNCTION calculate_case_priority();

-- Vue pour les statistiques par type de cas
CREATE OR REPLACE VIEW case_type_statistics AS
SELECT 
    case_type,
    COUNT(*) as total_cases,
    COUNT(*) FILTER (WHERE status = 'active') as active_cases,
    COUNT(*) FILTER (WHERE status = 'found') as resolved_cases,
    COUNT(*) FILTER (WHERE is_emergency = true) as emergency_cases,
    AVG(age) as average_age,
    MIN(date_disappeared) as oldest_case,
    MAX(date_disappeared) as newest_case
FROM missing_persons
GROUP BY case_type;

-- Commentaires pour documenter les nouveaux champs
COMMENT ON COLUMN missing_persons.case_type IS 'Type de cas: disappearance, runaway, abduction, missing_adult, missing_child';
COMMENT ON COLUMN missing_persons.priority IS 'Priorité du cas: low, medium, high, critical';
COMMENT ON COLUMN missing_persons.circumstances IS 'Circonstances spécifiques de la disparition';
COMMENT ON COLUMN missing_persons.time_disappeared IS 'Heure approximative de la disparition';
COMMENT ON COLUMN missing_persons.is_emergency IS 'Indique si le cas nécessite une attention immédiate';
COMMENT ON COLUMN missing_persons.last_contact_date IS 'Dernière fois que la personne a été contactée';
COMMENT ON COLUMN missing_persons.clothing_description IS 'Description des vêtements portés au moment de la disparition';
COMMENT ON COLUMN missing_persons.personal_items IS 'Objets personnels emportés ou laissés';
COMMENT ON COLUMN missing_persons.medical_info IS 'Informations médicales importantes (médicaments, conditions, etc.)';
COMMENT ON COLUMN missing_persons.behavioral_info IS 'Informations comportementales récentes';
