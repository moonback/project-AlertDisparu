# Configuration de l'API Gemini pour l'analyse d'images

## Vue d'ensemble

Cette fonctionnalité permet d'analyser automatiquement les photos ajoutées dans le formulaire "Ajouter une observation" en utilisant l'API Gemini de Google. L'IA peut extraire des informations utiles comme la description des vêtements, le comportement observé, les personnes accompagnant, etc.

## Configuration requise

### 1. Obtenir une clé API Gemini

1. Allez sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Connectez-vous avec votre compte Google
3. Cliquez sur "Create API Key"
4. Copiez votre clé API

### 2. Configuration de l'environnement

Ajoutez votre clé API dans votre fichier `.env` :

```env
VITE_GEMINI_API_KEY=votre_cle_api_gemini_ici
```

### 3. Redémarrage du serveur

Après avoir ajouté la clé API, redémarrez votre serveur de développement :

```bash
npm run dev
```

## Fonctionnalités

### Analyse automatique d'images

- **Description générale** : Analyse globale de ce qui est visible dans l'image
- **Vêtements** : Description détaillée des vêtements, chaussures, accessoires
- **Comportement** : Description des actions ou comportements observés
- **Personnes accompagnant** : Identification d'autres personnes dans l'image
- **Véhicules** : Description de véhicules visibles
- **Environnement** : Description du lieu/environnement
- **Niveau de confiance** : Évaluation de la qualité de l'image

### Utilisation

1. Ajoutez une photo dans le formulaire "Ajouter une observation"
2. Cliquez sur le bouton "Analyser" sous la photo
3. L'IA analyse l'image et propose des informations
4. Cliquez sur "Appliquer l'analyse" pour remplir automatiquement les champs du formulaire
5. Vérifiez et ajustez les informations si nécessaire

## Sécurité et confidentialité

- Les images sont envoyées directement à l'API Gemini de Google
- Aucune donnée n'est stockée par Google selon leur politique de confidentialité
- Les images ne sont pas conservées après l'analyse
- Utilisez uniquement des images appropriées et légales

## Limitations

- L'analyse dépend de la qualité et de la clarté de l'image
- Les résultats peuvent varier selon le contenu de l'image
- L'IA peut parfois faire des erreurs d'interprétation
- Toujours vérifier et ajuster les informations générées

## Dépannage

### Erreur "Clé API Gemini non configurée"
- Vérifiez que `VITE_GEMINI_API_KEY` est défini dans votre fichier `.env`
- Redémarrez le serveur après avoir ajouté la clé

### Erreur d'analyse
- Vérifiez que votre clé API est valide
- Assurez-vous que l'image est au format supporté (JPG, PNG, etc.)
- Vérifiez votre connexion internet

### Résultats inattendus
- L'IA peut parfois mal interpréter les images
- Toujours vérifier et corriger les informations générées
- Ajoutez des descriptions manuelles si nécessaire
