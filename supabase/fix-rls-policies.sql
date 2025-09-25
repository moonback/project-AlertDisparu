-- Script pour corriger les politiques RLS de la table missing_persons
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Supprimer les anciennes politiques s'il y en a
DROP POLICY IF EXISTS "Tout le monde peut voir les signalements publics" ON missing_persons;
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent créer des signalements" ON missing_persons;
DROP POLICY IF EXISTS "Les créateurs peuvent mettre à jour leurs signalements" ON missing_persons;

-- 2. Créer les nouvelles politiques RLS

-- Politique pour SELECT (lecture) - tout le monde peut voir les signalements publics
CREATE POLICY "missing_persons_select_policy" ON missing_persons
  FOR SELECT USING (true);

-- Politique pour INSERT (création) - utilisateurs authentifiés peuvent créer
CREATE POLICY "missing_persons_insert_policy" ON missing_persons
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = created_by
  );

-- Politique pour UPDATE (modification) - créateurs peuvent modifier leurs signalements
CREATE POLICY "missing_persons_update_policy" ON missing_persons
  FOR UPDATE USING (
    auth.uid() IS NOT NULL 
    AND auth.uid() = created_by
  );

-- Politique pour DELETE (suppression) - créateurs peuvent supprimer leurs signalements
CREATE POLICY "missing_persons_delete_policy" ON missing_persons
  FOR DELETE USING (
    auth.uid() IS NOT NULL 
    AND auth.uid() = created_by
  );

-- 3. Vérifier que RLS est activé
ALTER TABLE missing_persons ENABLE ROW LEVEL SECURITY;

-- 4. Test de la politique (optionnel - à exécuter après connexion)
-- SELECT auth.uid() as current_user_id;

-- 5. Vérifier les politiques créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'missing_persons';
