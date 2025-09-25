# Guide des Photos d'Investigation

## Vue d'ensemble

Le système d'investigation permet maintenant d'ajouter des photos aux observations pour enrichir les rapports de témoignages.

## Fonctionnalités

### 📸 Upload de Photos
- **Maximum 5 photos** par observation
- **Taille maximale** : 5MB par photo
- **Formats supportés** : JPEG, PNG, WebP, GIF
- **Descriptions optionnelles** pour chaque photo

### 🖼️ Affichage des Photos
- **Grille responsive** : 2 colonnes sur mobile, 3 sur desktop
- **Aperçu cliquable** : clic pour ouvrir en plein écran
- **Descriptions** affichées en overlay sur les photos
- **Indicateur visuel** au survol

## Configuration de la Base de Données

### 1. Exécuter les Scripts SQL

```sql
-- 1. Ajouter les colonnes photos
-- Exécuter add-photos-to-investigation.sql

-- 2. Créer le bucket de stockage
-- Exécuter create-photo-storage.sql
```

### 2. Structure des Données

```sql
-- Colonnes ajoutées à investigation_observations
photos TEXT[] DEFAULT '{}'           -- URLs des photos
photo_descriptions TEXT[] DEFAULT '{}' -- Descriptions des photos
```

## Utilisation

### Pour les Utilisateurs

1. **Ajouter une Observation**
   - Remplir le formulaire d'observation
   - Dans la section "Photos", cliquer sur "Ajouter des photos"
   - Sélectionner jusqu'à 5 images
   - Ajouter des descriptions optionnelles
   - Soumettre l'observation

2. **Consulter les Observations**
   - Les photos s'affichent automatiquement dans la liste
   - Clic sur une photo pour l'agrandir
   - Les descriptions apparaissent en overlay

### Pour les Développeurs

#### Composant PhotoUpload

```tsx
import { PhotoUpload, PhotoUploadItem } from '../ui/PhotoUpload';

const [photos, setPhotos] = useState<PhotoUploadItem[]>([]);

<PhotoUpload
  photos={photos}
  onPhotosChange={setPhotos}
  maxPhotos={5}
  maxSizeMB={5}
/>
```

#### Interface PhotoUploadItem

```typescript
interface PhotoUploadItem {
  id: string;
  file: File;
  preview: string;
  description: string;
}
```

#### Upload vers Supabase Storage

```typescript
const uploadPhotos = async (photos: PhotoUploadItem[]): Promise<string[]> => {
  const uploadedUrls: string[] = [];
  
  for (const photo of photos) {
    const fileName = `observation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('investigation-photos')
      .upload(fileName, photo.file);
    
    if (!error) {
      const { data: urlData } = supabase.storage
        .from('investigation-photos')
        .getPublicUrl(fileName);
      
      uploadedUrls.push(urlData.publicUrl);
    }
  }
  
  return uploadedUrls;
};
```

## Sécurité

### Politiques RLS

- **Upload** : Utilisateurs authentifiés uniquement
- **Lecture** : Photos publiques (tous peuvent voir)
- **Suppression** : Créateurs uniquement

### Validation

- **Types de fichiers** : Images uniquement
- **Taille** : Maximum 5MB par photo
- **Nombre** : Maximum 5 photos par observation

## Stockage

### Supabase Storage

- **Bucket** : `investigation-photos`
- **Structure** : `observation-{timestamp}-{random}.{ext}`
- **Accès** : URLs publiques générées automatiquement

### Base de Données

- **Table** : `investigation_observations`
- **Colonnes** : `photos[]`, `photo_descriptions[]`
- **Index** : GIN sur `photos` pour les recherches

## Exemples d'Usage

### Observation avec Photos

```typescript
const observationData = {
  missingPersonId: "uuid",
  observerName: "Jean Dupont",
  description: "Vu la personne près de la gare",
  photos: [
    "https://supabase.co/storage/v1/object/public/investigation-photos/photo1.jpg",
    "https://supabase.co/storage/v1/object/public/investigation-photos/photo2.jpg"
  ],
  photoDescriptions: [
    "Photo de la personne de face",
    "Photo du véhicule qu'elle utilisait"
  ]
};
```

### Affichage des Photos

```tsx
{observation.photos && observation.photos.length > 0 && (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
    {observation.photos.map((photoUrl, index) => (
      <img
        key={index}
        src={photoUrl}
        alt={`Photo ${index + 1}`}
        className="w-full h-32 object-cover rounded-lg cursor-pointer"
        onClick={() => window.open(photoUrl, '_blank')}
      />
    ))}
  </div>
)}
```

## Dépannage

### Photos ne s'affichent pas
- Vérifier que le bucket `investigation-photos` existe
- Vérifier les politiques RLS
- Vérifier que les URLs sont publiques

### Erreur d'upload
- Vérifier la taille des fichiers (< 5MB)
- Vérifier le format (images uniquement)
- Vérifier l'authentification utilisateur

### Performance
- Les photos sont optimisées automatiquement par Supabase
- Utiliser des formats WebP pour de meilleures performances
- Limiter le nombre de photos par observation

## Améliorations Futures

- [ ] Compression automatique des images
- [ ] Redimensionnement côté client
- [ ] Galerie photo avec navigation
- [ ] Annotations sur les photos
- [ ] Géolocalisation des photos
- [ ] Modération automatique du contenu
