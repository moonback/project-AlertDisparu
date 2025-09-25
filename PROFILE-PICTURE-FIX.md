# Correction - Erreur Photo de Profil

## Problème
L'erreur "Erreur lors de la mise à jour de la photo" se produit car la colonne `profile_picture` n'existe pas dans la table `profiles` de votre base de données Supabase.

## Solution

### 1. Accéder à Supabase
1. Connectez-vous à votre tableau de bord Supabase
2. Allez dans l'onglet **SQL Editor**
3. Créez une nouvelle requête

### 2. Exécuter le Script de Correction

Copiez et exécutez ce script SQL :

```sql
-- Ajouter la colonne profile_picture à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN profiles.profile_picture IS 'Photo de profil de l''utilisateur en base64';

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'profile_picture';
```

### 3. Script Complet (Optionnel)

Si vous voulez mettre à jour toute la structure de la table `profiles`, exécutez ce script plus complet :

```sql
-- Script pour mettre à jour la table profiles avec toutes les colonnes nécessaires
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_picture TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Créer un trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer le trigger si il n'existe pas déjà
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Vérifier la structure de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
```

### 4. Vérification

Après avoir exécuté le script, vous devriez voir dans les résultats :
- `profile_picture` avec le type `text`
- `created_at` et `updated_at` avec le type `timestamp with time zone`

### 5. Tester l'Application

1. Rafraîchissez votre application
2. Allez sur la page de profil (`/profil`)
3. Essayez d'uploader une photo de profil
4. L'erreur devrait être corrigée

## Structure de la Table `profiles`

Après correction, votre table `profiles` devrait avoir cette structure :

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    role TEXT,
    profile_picture TEXT,        -- ✅ Nouvelle colonne
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Alternative - Via l'Interface Supabase

Si vous préférez utiliser l'interface graphique :

1. Allez dans **Table Editor**
2. Sélectionnez la table `profiles`
3. Cliquez sur **Add Column**
4. Nom : `profile_picture`
5. Type : `text`
6. Nullable : ✅ (oui)
7. Cliquez sur **Save**

## Notes Importantes

- **Sauvegarde** : Faites toujours une sauvegarde avant de modifier la structure
- **Permissions** : Assurez-vous que votre utilisateur a les droits de modification
- **RLS** : Les politiques RLS existantes s'appliqueront automatiquement
- **Performance** : Les images en base64 peuvent être volumineuses, considérez Supabase Storage pour l'avenir

## Support

Si vous rencontrez encore des problèmes :
1. Vérifiez les logs de la console du navigateur
2. Vérifiez les logs Supabase dans l'onglet Logs
3. Assurez-vous que les variables d'environnement sont correctement configurées
