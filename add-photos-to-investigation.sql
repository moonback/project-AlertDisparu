-- Ajout du support des photos aux observations d'investigation
-- À exécuter après investigation-observations.sql

-- Ajouter une colonne pour stocker les URLs des photos
ALTER TABLE investigation_observations 
ADD COLUMN photos TEXT[] DEFAULT '{}';

-- Ajouter une colonne pour stocker les descriptions des photos
ALTER TABLE investigation_observations 
ADD COLUMN photo_descriptions TEXT[] DEFAULT '{}';

-- Créer un index pour les recherches par photos
CREATE INDEX IF NOT EXISTS idx_investigation_observations_photos 
ON investigation_observations USING GIN (photos);

-- Fonction pour ajouter une photo à une observation
CREATE OR REPLACE FUNCTION add_photo_to_observation(
    observation_id UUID,
    photo_url TEXT,
    photo_description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    -- Vérifier que l'observation existe et que l'utilisateur peut la modifier
    IF NOT EXISTS (
        SELECT 1 FROM investigation_observations 
        WHERE id = observation_id 
        AND (created_by = auth.uid() OR auth.uid() IS NOT NULL)
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Ajouter la photo et sa description
    UPDATE investigation_observations 
    SET 
        photos = array_append(photos, photo_url),
        photo_descriptions = CASE 
            WHEN photo_description IS NOT NULL THEN array_append(photo_descriptions, photo_description)
            ELSE array_append(photo_descriptions, '')
        END,
        updated_at = NOW()
    WHERE id = observation_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour supprimer une photo d'une observation
CREATE OR REPLACE FUNCTION remove_photo_from_observation(
    observation_id UUID,
    photo_index INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    current_photos TEXT[];
    current_descriptions TEXT[];
BEGIN
    -- Vérifier que l'observation existe et que l'utilisateur peut la modifier
    IF NOT EXISTS (
        SELECT 1 FROM investigation_observations 
        WHERE id = observation_id 
        AND (created_by = auth.uid() OR auth.uid() IS NOT NULL)
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Récupérer les photos et descriptions actuelles
    SELECT photos, photo_descriptions 
    INTO current_photos, current_descriptions
    FROM investigation_observations 
    WHERE id = observation_id;
    
    -- Vérifier que l'index est valide
    IF photo_index < 1 OR photo_index > array_length(current_photos, 1) THEN
        RETURN FALSE;
    END IF;
    
    -- Supprimer la photo et sa description
    UPDATE investigation_observations 
    SET 
        photos = array_remove(current_photos, current_photos[photo_index]),
        photo_descriptions = array_remove(current_descriptions, current_descriptions[photo_index]),
        updated_at = NOW()
    WHERE id = observation_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vue pour les observations avec informations sur les photos
CREATE OR REPLACE VIEW observations_with_photo_info AS
SELECT 
    io.*,
    array_length(io.photos, 1) as photo_count,
    CASE 
        WHEN array_length(io.photos, 1) > 0 THEN true 
        ELSE false 
    END as has_photos
FROM investigation_observations io;

-- Commentaires pour documenter les nouveaux champs
COMMENT ON COLUMN investigation_observations.photos IS 'URLs des photos jointes à l''observation';
COMMENT ON COLUMN investigation_observations.photo_descriptions IS 'Descriptions des photos jointes à l''observation';

-- Exemple d'utilisation des fonctions :
-- SELECT add_photo_to_observation('observation-uuid', 'https://example.com/photo.jpg', 'Photo de la personne vue dans la rue');
-- SELECT remove_photo_from_observation('observation-uuid', 1);
