-- Script pour créer le bucket de stockage des photos d'investigation
-- À exécuter dans l'éditeur SQL de Supabase

-- Créer le bucket pour les photos d'investigation
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'investigation-photos',
  'investigation-photos',
  true,
  5242880, -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Politique pour permettre l'upload des photos aux utilisateurs authentifiés
CREATE POLICY "Les utilisateurs authentifiés peuvent uploader des photos d'investigation" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'investigation-photos' 
  AND auth.uid() IS NOT NULL
);

-- Politique pour permettre la lecture des photos à tous (photos publiques)
CREATE POLICY "Les photos d'investigation sont publiques" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'investigation-photos');

-- Politique pour permettre la suppression des photos aux créateurs
CREATE POLICY "Les créateurs peuvent supprimer leurs photos d'investigation" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'investigation-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Le bucket 'investigation-photos' est maintenant créé pour stocker les photos d'observations
-- Taille maximale : 5MB par fichier
-- Formats autorisés : JPEG, PNG, WebP, GIF
-- Accès : Public en lecture, authentifié en écriture
