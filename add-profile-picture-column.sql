-- Ajouter la colonne profile_picture à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN profiles.profile_picture IS 'Photo de profil de l''utilisateur en base64';

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'profile_picture';
