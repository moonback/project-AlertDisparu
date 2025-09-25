-- Script de configuration de la base de données Supabase pour SafeFind

-- Créer la table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('family', 'authority', 'volunteer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table des personnes disparues
CREATE TABLE IF NOT EXISTS missing_persons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    photo TEXT,
    date_disappeared DATE NOT NULL,
    location_address TEXT NOT NULL,
    location_city TEXT NOT NULL,
    location_state TEXT NOT NULL,
    location_country TEXT NOT NULL DEFAULT 'France',
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    description TEXT NOT NULL,
    reporter_name TEXT NOT NULL,
    reporter_relationship TEXT NOT NULL,
    reporter_phone TEXT,
    reporter_email TEXT,
    consent_given BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL CHECK (status IN ('active', 'found', 'closed')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Créer un index pour les recherches
CREATE INDEX IF NOT EXISTS idx_missing_persons_status ON missing_persons(status);
CREATE INDEX IF NOT EXISTS idx_missing_persons_location ON missing_persons(location_city, location_state);
CREATE INDEX IF NOT EXISTS idx_missing_persons_date ON missing_persons(date_disappeared);
CREATE INDEX IF NOT EXISTS idx_missing_persons_age ON missing_persons(age);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_missing_persons_updated_at BEFORE UPDATE ON missing_persons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politique RLS pour les profils
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs peuvent voir leur propre profil" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Politique RLS pour les personnes disparues
ALTER TABLE missing_persons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les personnes disparues actives" ON missing_persons
    FOR SELECT USING (status = 'active');

CREATE POLICY "Les utilisateurs authentifiés peuvent créer des signalements" ON missing_persons
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Les créateurs peuvent mettre à jour leurs signalements" ON missing_persons
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Les créateurs peuvent supprimer leurs signalements" ON missing_persons
    FOR DELETE USING (auth.uid() = created_by);

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'volunteer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
