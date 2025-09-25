# Documentation API - AlertDisparu

## Vue d'ensemble

AlertDisparu utilise **Supabase** comme backend, qui fournit automatiquement une API REST basée sur le schéma de base de données PostgreSQL. Cette documentation décrit les endpoints disponibles et leur utilisation.

## 🔐 Authentification

### Configuration du client Supabase

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)
```

### Headers d'authentification

Toutes les requêtes authentifiées incluent automatiquement le token JWT :

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## 👤 API des profils utilisateurs

### Table : `profiles`

#### GET /profiles

Récupère le profil de l'utilisateur connecté.

```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()
```

**Réponse :**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "family",
  "profile_picture": "https://...",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### PUT /profiles

Met à jour le profil utilisateur.

```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({
    first_name: "John",
    last_name: "Doe",
    profile_picture: "https://..."
  })
  .eq('id', userId)
```

**Contraintes RLS :** L'utilisateur ne peut modifier que son propre profil.

## 📝 API des signalements

### Table : `missing_persons`

#### GET /missing_persons

Récupère la liste des signalements avec filtres.

```typescript
// Tous les signalements actifs
const { data, error } = await supabase
  .from('missing_persons')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false })

// Avec filtres
const { data, error } = await supabase
  .from('missing_persons')
  .select('*')
  .eq('status', 'active')
  .eq('gender', 'male')
  .gte('age', 18)
  .lte('age', 65)
  .ilike('location_city', '%Paris%')
  .order('created_at', { ascending: false })
```

**Paramètres de filtrage :**
- `status` : `active`, `found`, `closed`
- `gender` : `male`, `female`, `other`
- `case_type` : `disappearance`, `runaway`, `abduction`, `missing_adult`, `missing_child`
- `priority` : `low`, `medium`, `high`, `critical`
- `is_emergency` : `true`, `false`
- `age` : `gte` (greater than or equal), `lte` (less than or equal)
- `location_city` : `ilike` (case insensitive like)
- `date_disappeared` : `gte`, `lte`

**Réponse :**
```json
[
  {
    "id": "uuid",
    "first_name": "Jane",
    "last_name": "Smith",
    "age": 25,
    "gender": "female",
    "photo": "https://...",
    "date_disappeared": "2024-01-15",
    "time_disappeared": "14:30:00",
    "location_address": "123 Rue de la Paix",
    "location_city": "Paris",
    "location_state": "Île-de-France",
    "location_country": "France",
    "location_lat": 48.8566,
    "location_lng": 2.3522,
    "description": "Description de la disparition...",
    "case_type": "disappearance",
    "priority": "high",
    "status": "active",
    "is_emergency": false,
    "circumstances": "Circonstances de la disparition...",
    "clothing_description": "Vêtements portés...",
    "personal_items": "Objets personnels...",
    "medical_info": "Informations médicales...",
    "behavioral_info": "Comportement...",
    "reporter_name": "John Smith",
    "reporter_relationship": "Père",
    "reporter_phone": "+33123456789",
    "reporter_email": "john@example.com",
    "consent_given": true,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "created_by": "uuid"
  }
]
```

#### GET /missing_persons/:id

Récupère un signalement spécifique.

```typescript
const { data, error } = await supabase
  .from('missing_persons')
  .select('*')
  .eq('id', reportId)
  .single()
```

#### POST /missing_persons

Crée un nouveau signalement.

```typescript
const { data, error } = await supabase
  .from('missing_persons')
  .insert({
    first_name: "Jane",
    last_name: "Smith",
    age: 25,
    gender: "female",
    photo: "https://...",
    date_disappeared: "2024-01-15",
    time_disappeared: "14:30:00",
    location_address: "123 Rue de la Paix",
    location_city: "Paris",
    location_state: "Île-de-France",
    location_country: "France",
    location_lat: 48.8566,
    location_lng: 2.3522,
    description: "Description de la disparition...",
    case_type: "disappearance",
    priority: "high",
    status: "active",
    is_emergency: false,
    circumstances: "Circonstances...",
    clothing_description: "Vêtements...",
    personal_items: "Objets...",
    medical_info: "Médical...",
    behavioral_info: "Comportement...",
    reporter_name: "John Smith",
    reporter_relationship: "Père",
    reporter_phone: "+33123456789",
    reporter_email: "john@example.com",
    consent_given: true,
    created_by: userId
  })
  .select()
  .single()
```

**Contraintes RLS :** Seuls les utilisateurs authentifiés peuvent créer des signalements.

#### PUT /missing_persons/:id

Met à jour un signalement existant.

```typescript
const { data, error } = await supabase
  .from('missing_persons')
  .update({
    status: "found",
    updated_at: new Date().toISOString()
  })
  .eq('id', reportId)
  .eq('created_by', userId) // Seulement le créateur peut modifier
```

**Contraintes RLS :** Seul le créateur du signalement peut le modifier.

#### DELETE /missing_persons/:id

Supprime un signalement.

```typescript
const { data, error } = await supabase
  .from('missing_persons')
  .delete()
  .eq('id', reportId)
  .eq('created_by', userId) // Seulement le créateur peut supprimer
```

**Contraintes RLS :** Seul le créateur du signalement peut le supprimer.

## 🔍 API des observations d'investigation

### Table : `investigation_observations`

#### GET /investigation_observations

Récupère les observations pour un signalement spécifique.

```typescript
const { data, error } = await supabase
  .from('investigation_observations')
  .select(`
    *,
    missing_persons!inner(location_lat, location_lng)
  `)
  .eq('missing_person_id', reportId)
  .order('observation_date', { ascending: false })
```

**Réponse :**
```json
[
  {
    "id": "uuid",
    "missing_person_id": "uuid",
    "observer_name": "Témoin",
    "observer_phone": "+33123456789",
    "observer_email": "témoin@example.com",
    "observation_date": "2024-01-16",
    "observation_time": "15:30:00",
    "location_address": "456 Avenue des Champs",
    "location_city": "Paris",
    "location_state": "Île-de-France",
    "location_country": "France",
    "location_lat": 48.8566,
    "location_lng": 2.3522,
    "description": "Observation détaillée...",
    "confidence_level": "high",
    "clothing_description": "Vêtements observés...",
    "behavior_description": "Comportement observé...",
    "companions": "Personnes accompagnantes...",
    "vehicle_info": "Informations véhicule...",
    "witness_contact_consent": true,
    "is_verified": false,
    "verified_by": null,
    "verified_at": null,
    "photos": ["https://...", "https://..."],
    "photo_descriptions": ["Description photo 1", "Description photo 2"],
    "created_at": "2024-01-16T15:30:00Z",
    "updated_at": "2024-01-16T15:30:00Z",
    "created_by": "uuid"
  }
]
```

#### POST /investigation_observations

Crée une nouvelle observation.

```typescript
const { data, error } = await supabase
  .from('investigation_observations')
  .insert({
    missing_person_id: reportId,
    observer_name: "Témoin",
    observer_phone: "+33123456789",
    observer_email: "témoin@example.com",
    observation_date: "2024-01-16",
    observation_time: "15:30:00",
    location_address: "456 Avenue des Champs",
    location_city: "Paris",
    location_state: "Île-de-France",
    location_country: "France",
    location_lat: 48.8566,
    location_lng: 2.3522,
    description: "Observation détaillée...",
    confidence_level: "high",
    clothing_description: "Vêtements observés...",
    behavior_description: "Comportement observé...",
    companions: "Personnes accompagnantes...",
    vehicle_info: "Informations véhicule...",
    witness_contact_consent: true,
    photos: ["https://...", "https://..."],
    photo_descriptions: ["Description photo 1", "Description photo 2"],
    created_by: userId
  })
  .select()
  .single()
```

**Contraintes RLS :** Seuls les utilisateurs authentifiés peuvent créer des observations.

#### PUT /investigation_observations/:id

Met à jour une observation (vérification par les autorités).

```typescript
const { data, error } = await supabase
  .from('investigation_observations')
  .update({
    is_verified: true,
    verified_by: userId,
    verified_at: new Date().toISOString()
  })
  .eq('id', observationId)
```

**Contraintes RLS :** Seules les autorités peuvent vérifier les observations.

## 📊 API des statistiques

### Vue : `observation_statistics`

#### GET /observation_statistics

Récupère les statistiques d'observations par signalement.

```typescript
const { data, error } = await supabase
  .from('observation_statistics')
  .select('*')
  .eq('missing_person_id', reportId)
  .single()
```

**Réponse :**
```json
{
  "missing_person_id": "uuid",
  "first_name": "Jane",
  "last_name": "Smith",
  "total_observations": 15,
  "verified_observations": 8,
  "high_confidence_observations": 5,
  "first_observation_date": "2024-01-16",
  "last_observation_date": "2024-01-20",
  "cities_with_observations": 3
}
```

### Vue : `observations_with_distances`

#### GET /observations_with_distances

Récupère les observations avec distances calculées.

```typescript
const { data, error } = await supabase
  .from('observations_with_distances')
  .select('*')
  .eq('missing_person_id', reportId)
  .order('distance_from_disappearance_km', { ascending: true })
```

**Réponse :**
```json
[
  {
    "id": "uuid",
    "missing_person_id": "uuid",
    "observer_name": "Témoin",
    "observation_date": "2024-01-16",
    "location_lat": 48.8566,
    "location_lng": 2.3522,
    "disappearance_lat": 48.8566,
    "disappearance_lng": 2.3522,
    "distance_from_disappearance_km": 0.5
  }
]
```

## 🔐 API d'authentification Supabase

### POST /auth/v1/signup

Inscription d'un nouvel utilisateur.

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      first_name: 'John',
      last_name: 'Doe',
      role: 'family'
    }
  }
})
```

### POST /auth/v1/token

Connexion d'un utilisateur.

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})
```

### POST /auth/v1/logout

Déconnexion de l'utilisateur.

```typescript
const { error } = await supabase.auth.signOut()
```

### GET /auth/v1/user

Récupère l'utilisateur actuellement connecté.

```typescript
const { data: { user }, error } = await supabase.auth.getUser()
```

## 📁 API de stockage de fichiers

### POST /storage/v1/object/upload

Upload d'un fichier (photo de profil, photos de signalement).

```typescript
const { data, error } = await supabase.storage
  .from('photos')
  .upload(`profiles/${userId}/avatar.jpg`, file, {
    cacheControl: '3600',
    upsert: true
  })
```

### GET /storage/v1/object/public

Récupération d'un fichier public.

```typescript
const { data } = supabase.storage
  .from('photos')
  .getPublicUrl(`profiles/${userId}/avatar.jpg`)
```

## 🔄 Abonnements en temps réel

### Abonnement aux signalements

```typescript
const subscription = supabase
  .channel('missing_persons_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'missing_persons'
  }, (payload) => {
    console.log('Changement détecté:', payload)
    // Mettre à jour l'état local
  })
  .subscribe()
```

### Abonnement aux observations

```typescript
const subscription = supabase
  .channel('observations_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'investigation_observations',
    filter: `missing_person_id=eq.${reportId}`
  }, (payload) => {
    console.log('Nouvelle observation:', payload)
    // Mettre à jour l'interface
  })
  .subscribe()
```

## 🚨 Gestion des erreurs

### Codes d'erreur courants

| Code | Description | Solution |
|------|-------------|----------|
| `PGRST116` | Aucune ligne trouvée | Vérifier l'ID ou les filtres |
| `PGRST301` | Violation de contrainte | Vérifier les données d'entrée |
| `42501` | Permission refusée | Vérifier les politiques RLS |
| `23505` | Violation de contrainte unique | Données en double |

### Exemple de gestion d'erreur

```typescript
try {
  const { data, error } = await supabase
    .from('missing_persons')
    .insert(reportData)
    .select()
    .single()
  
  if (error) {
    if (error.code === 'PGRST301') {
      throw new Error('Données invalides')
    } else if (error.code === '42501') {
      throw new Error('Permission refusée')
    } else {
      throw new Error('Erreur inconnue')
    }
  }
  
  return data
} catch (error) {
  console.error('Erreur API:', error.message)
  throw error
}
```

## 📈 Limites et quotas

### Limites Supabase (plan gratuit)

- **Requêtes API** : 50,000/mois
- **Stockage** : 500 MB
- **Bandwidth** : 2 GB/mois
- **Connexions simultanées** : 60

### Optimisation des requêtes

```typescript
// ✅ Bon : Sélectionner seulement les champs nécessaires
const { data } = await supabase
  .from('missing_persons')
  .select('id, first_name, last_name, status')
  .eq('status', 'active')

// ❌ Mauvais : Sélectionner tous les champs
const { data } = await supabase
  .from('missing_persons')
  .select('*')
  .eq('status', 'active')
```

## 🔧 Configuration avancée

### Filtres complexes

```typescript
// Recherche textuelle avec plusieurs champs
const { data } = await supabase
  .from('missing_persons')
  .select('*')
  .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,location_city.ilike.%${query}%`)

// Filtrage par plage de dates
const { data } = await supabase
  .from('missing_persons')
  .select('*')
  .gte('date_disappeared', startDate)
  .lte('date_disappeared', endDate)

// Filtrage géographique (rayon)
const { data } = await supabase
  .from('missing_persons')
  .select('*')
  .gte('location_lat', minLat)
  .lte('location_lat', maxLat)
  .gte('location_lng', minLng)
  .lte('location_lng', maxLng)
```

### Pagination

```typescript
const pageSize = 20
const page = 1

const { data, error } = await supabase
  .from('missing_persons')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .range((page - 1) * pageSize, page * pageSize - 1)
```

---

Cette API REST automatique fournie par Supabase permet une intégration rapide et sécurisée avec le frontend React, tout en bénéficiant des fonctionnalités avancées de PostgreSQL et de la sécurité RLS.
