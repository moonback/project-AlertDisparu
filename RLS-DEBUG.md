# 🔒 Débogage des politiques RLS (Row Level Security)

## 🚨 Problème identifié

L'erreur `new row violates row-level security policy for table "missing_persons"` indique que la politique RLS empêche l'insertion.

## 🔍 Diagnostic

### 1. Vérifier l'authentification dans Supabase
```sql
-- Dans l'éditeur SQL de Supabase, exécutez :
SELECT auth.uid() as current_user_id;
```

### 2. Vérifier les politiques existantes
```sql
-- Voir toutes les politiques sur la table missing_persons
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
```

### 3. Vérifier que RLS est activé
```sql
-- Vérifier si RLS est activé sur la table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'missing_persons';
```

## 🛠️ Solution

### Étape 1 : Exécuter le script de correction
1. Allez dans votre **Supabase Dashboard**
2. Ouvrez l'**éditeur SQL**
3. Copiez et exécutez le contenu de `fix-rls-policies.sql`

### Étape 2 : Vérifier la structure de la table
```sql
-- Vérifier que la colonne created_by existe et a le bon type
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'missing_persons' 
AND column_name = 'created_by';
```

### Étape 3 : Test de la politique
```sql
-- Test d'insertion (remplacez l'UUID par votre ID utilisateur)
INSERT INTO missing_persons (
  first_name, last_name, age, gender, date_disappeared,
  location_address, location_city, location_state, location_country,
  location_lat, location_lng, description,
  reporter_name, reporter_relationship, reporter_phone, reporter_email,
  consent_given, status, created_by
) VALUES (
  'Test', 'User', 25, 'male', '2024-01-01',
  '123 Test St', 'Test City', 'TC', 'France',
  48.8566, 2.3522, 'Test description',
  'Test Reporter', 'Friend', '+33123456789', 'test@example.com',
  true, 'active', auth.uid()
);
```

## 🔧 Problèmes courants

### 1. Colonne created_by manquante
```sql
-- Ajouter la colonne si elle n'existe pas
ALTER TABLE missing_persons 
ADD COLUMN created_by UUID REFERENCES auth.users(id);
```

### 2. Politique trop restrictive
```sql
-- Politique temporaire plus permissive pour debug
CREATE POLICY "debug_insert_policy" ON missing_persons
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

### 3. Token d'authentification expiré
- Vérifiez que vous êtes bien connecté
- Essayez de vous déconnecter et reconnecter
- Vérifiez la validité du token dans la console

## 📊 Vérification finale

### Dans la console du navigateur
```javascript
// Vérifier l'état d'authentification
const { data: { user } } = await window.supabase.auth.getUser();
console.log('Utilisateur:', user?.id);

// Vérifier la session
const { data: { session } } = await window.supabase.auth.getSession();
console.log('Session:', session?.access_token ? 'Valide' : 'Expirée');
```

### Test d'insertion directe
```javascript
// Test d'insertion depuis la console
const testData = {
  first_name: 'Test',
  last_name: 'Console',
  age: 30,
  gender: 'male',
  date_disappeared: '2024-01-01',
  location_address: '123 Test',
  location_city: 'Paris',
  location_state: 'IDF',
  location_country: 'France',
  location_lat: 48.8566,
  location_lng: 2.3522,
  description: 'Test depuis console',
  reporter_name: 'Test Reporter',
  reporter_relationship: 'Friend',
  reporter_phone: '+33123456789',
  reporter_email: 'test@example.com',
  consent_given: true,
  status: 'active',
  created_by: user.id
};

const { data, error } = await window.supabase
  .from('missing_persons')
  .insert(testData)
  .select('*');

console.log('Test insertion:', { data, error });
```

## 🎯 Résultat attendu

Après avoir exécuté le script `fix-rls-policies.sql`, vous devriez pouvoir :
1. ✅ Insérer des rapports depuis l'application
2. ✅ Voir les rapports dans la liste
3. ✅ Modifier vos propres rapports

Si le problème persiste, vérifiez que :
- Vous êtes bien connecté
- La colonne `created_by` existe dans la table
- Les politiques RLS sont correctement créées
- Le token d'authentification est valide
