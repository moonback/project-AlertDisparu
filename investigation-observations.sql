-- Extension du schéma pour supporter les observations d'investigation
-- À exécuter après extend-case-types.sql

-- Créer la table des observations
CREATE TABLE IF NOT EXISTS investigation_observations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    missing_person_id UUID NOT NULL REFERENCES missing_persons(id) ON DELETE CASCADE,
    observer_name TEXT NOT NULL,
    observer_phone TEXT,
    observer_email TEXT,
    observation_date DATE NOT NULL,
    observation_time TIME,
    location_address TEXT NOT NULL,
    location_city TEXT NOT NULL,
    location_state TEXT NOT NULL,
    location_country TEXT NOT NULL DEFAULT 'France',
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    description TEXT NOT NULL,
    confidence_level TEXT NOT NULL CHECK (confidence_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
    clothing_description TEXT,
    behavior_description TEXT,
    companions TEXT, -- Personnes accompagnant la personne disparue
    vehicle_info TEXT, -- Informations sur un véhicule éventuel
    witness_contact_consent BOOLEAN NOT NULL DEFAULT false,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_investigation_observations_missing_person ON investigation_observations(missing_person_id);
CREATE INDEX IF NOT EXISTS idx_investigation_observations_date ON investigation_observations(observation_date);
CREATE INDEX IF NOT EXISTS idx_investigation_observations_location ON investigation_observations(location_city, location_state);
CREATE INDEX IF NOT EXISTS idx_investigation_observations_verified ON investigation_observations(is_verified);
CREATE INDEX IF NOT EXISTS idx_investigation_observations_confidence ON investigation_observations(confidence_level);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_investigation_observations_updated_at 
    BEFORE UPDATE ON investigation_observations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS pour les observations
ALTER TABLE investigation_observations ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut voir les observations vérifiées
CREATE POLICY "Les observations vérifiées sont visibles par tous" ON investigation_observations
    FOR SELECT USING (is_verified = true);

-- Les créateurs peuvent voir leurs propres observations
CREATE POLICY "Les créateurs peuvent voir leurs observations" ON investigation_observations
    FOR SELECT USING (auth.uid() = created_by);

-- Les utilisateurs authentifiés peuvent créer des observations
CREATE POLICY "Les utilisateurs authentifiés peuvent créer des observations" ON investigation_observations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Les créateurs peuvent mettre à jour leurs observations
CREATE POLICY "Les créateurs peuvent mettre à jour leurs observations" ON investigation_observations
    FOR UPDATE USING (auth.uid() = created_by);

-- Les créateurs peuvent supprimer leurs observations
CREATE POLICY "Les créateurs peuvent supprimer leurs observations" ON investigation_observations
    FOR DELETE USING (auth.uid() = created_by);

-- Les autorités peuvent vérifier les observations
CREATE POLICY "Les autorités peuvent vérifier les observations" ON investigation_observations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'authority'
        )
    );

-- Vue pour les statistiques d'observations
CREATE OR REPLACE VIEW observation_statistics AS
SELECT 
    mp.id as missing_person_id,
    mp.first_name,
    mp.last_name,
    COUNT(io.id) as total_observations,
    COUNT(io.id) FILTER (WHERE io.is_verified = true) as verified_observations,
    COUNT(io.id) FILTER (WHERE io.confidence_level = 'high') as high_confidence_observations,
    MIN(io.observation_date) as first_observation_date,
    MAX(io.observation_date) as last_observation_date,
    COUNT(DISTINCT io.location_city) as cities_with_observations
FROM missing_persons mp
LEFT JOIN investigation_observations io ON mp.id = io.missing_person_id
GROUP BY mp.id, mp.first_name, mp.last_name;

-- Fonction pour calculer la distance entre deux observations
CREATE OR REPLACE FUNCTION calculate_observation_distance(
    lat1 DECIMAL, lng1 DECIMAL, 
    lat2 DECIMAL, lng2 DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    -- Formule de Haversine pour calculer la distance en km
    RETURN 6371 * acos(
        cos(radians(lat1)) * cos(radians(lat2)) * 
        cos(radians(lng2) - radians(lng1)) + 
        sin(radians(lat1)) * sin(radians(lat2))
    );
END;
$$ LANGUAGE plpgsql;

-- Vue pour les observations avec distances calculées
CREATE OR REPLACE VIEW observations_with_distances AS
SELECT 
    io.*,
    mp.location_lat as disappearance_lat,
    mp.location_lng as disappearance_lng,
    calculate_observation_distance(
        io.location_lat, io.location_lng,
        mp.location_lat, mp.location_lng
    ) as distance_from_disappearance_km
FROM investigation_observations io
JOIN missing_persons mp ON io.missing_person_id = mp.id;

-- Commentaires pour documenter les nouveaux champs
COMMENT ON TABLE investigation_observations IS 'Observations d''investigation pour les personnes disparues';
COMMENT ON COLUMN investigation_observations.confidence_level IS 'Niveau de confiance: low, medium, high';
COMMENT ON COLUMN investigation_observations.companions IS 'Personnes accompagnant la personne disparue';
COMMENT ON COLUMN investigation_observations.vehicle_info IS 'Informations sur un véhicule éventuel';
COMMENT ON COLUMN investigation_observations.witness_contact_consent IS 'Consentement du témoin à être contacté';
COMMENT ON COLUMN investigation_observations.is_verified IS 'Observation vérifiée par les autorités';
COMMENT ON COLUMN investigation_observations.verified_by IS 'Utilisateur qui a vérifié l''observation';
COMMENT ON COLUMN investigation_observations.verified_at IS 'Date et heure de vérification';
