# Configuration AlertDisparu

## Configuration Supabase

Pour utiliser toutes les fonctionnalités de l'application, vous devez configurer Supabase.

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Attendez que le projet soit prêt

### 2. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet avec vos clés Supabase :

```env
VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

### 3. Configurer la base de données

Exécutez le script SQL fourni dans `supabase-setup.sql` dans l'éditeur SQL de Supabase :

```sql
-- Créer la table des profils utilisateurs
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('family', 'authority', 'volunteer')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table des personnes disparues
CREATE TABLE missing_persons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')) NOT NULL,
  photo TEXT,
  date_disappeared DATE NOT NULL,
  location_address TEXT NOT NULL,
  location_city TEXT NOT NULL,
  location_state TEXT NOT NULL,
  location_country TEXT NOT NULL DEFAULT 'France',
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  description TEXT NOT NULL,
  reporter_name TEXT NOT NULL,
  reporter_relationship TEXT NOT NULL,
  reporter_phone TEXT NOT NULL,
  reporter_email TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  status TEXT CHECK (status IN ('active', 'found', 'closed')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Activer RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE missing_persons ENABLE ROW LEVEL SECURITY;

-- Politiques pour les profils
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent insérer leur propre profil" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Politiques pour les personnes disparues
CREATE POLICY "Tout le monde peut voir les signalements publics" ON missing_persons
  FOR SELECT USING (true);

CREATE POLICY "Les utilisateurs authentifiés peuvent créer des signalements" ON missing_persons
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Les créateurs peuvent mettre à jour leurs signalements" ON missing_persons
  FOR UPDATE USING (auth.uid() = created_by);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_missing_persons_updated_at BEFORE UPDATE ON missing_persons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4. Redémarrer l'application

Après avoir configuré les variables d'environnement, redémarrez l'application :

```bash
npm run dev
```

## Mode Démo

Si Supabase n'est pas configuré, l'application fonctionne en mode démo avec :
- Des données de démonstration
- Un utilisateur de test
- Toutes les fonctionnalités disponibles localement

## Fonctionnalités

- ✅ Authentification (connexion/inscription)
- ✅ Gestion des profils utilisateurs
- ✅ Signalement de personnes disparues
- ✅ Recherche et filtres
- ✅ Carte interactive avec géolocalisation
- ✅ Alertes de proximité
- ✅ Interface responsive
- ✅ Conformité RGPD

## Technologies utilisées

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Supabase (PostgreSQL + Auth)
- React Router
- Zustand (state management)
- React Hook Form + Zod
- Leaflet (cartes)
- Lucide React (icônes)
