# Guide d'utilisation - Analyse d'image en premier

## Nouveau workflow optimisé

Le formulaire "Ajouter une observation" a été amélioré pour mettre l'analyse d'image en premier, permettant un remplissage automatique plus efficace.

## 🚀 Étapes d'utilisation

### 1. **Analyse d'image (EN PREMIER)**
- **Section principale** : "Analyse intelligente d'image"
- Cliquez sur "Sélectionner une photo"
- Choisissez votre image (JPG, PNG, GIF - max 5MB)
- Cliquez sur "Analyser avec IA"
- Attendez l'analyse (quelques secondes)
- Cliquez sur "Appliquer l'analyse"

### 2. **Vérification des champs remplis**
- Les champs suivants sont automatiquement remplis :
  - ✅ Description détaillée
  - ✅ Vêtements portés
  - ✅ Comportement observé
  - ✅ Personnes accompagnant
  - ✅ Informations sur véhicule
  - ✅ Niveau de confiance
- Un indicateur vert "Champs remplis automatiquement" apparaît

### 3. **Complétion manuelle**
- Complétez les informations personnelles :
  - Votre nom et coordonnées
  - Date et heure de l'observation
  - Adresse exacte du lieu
- Vérifiez et ajustez les champs remplis automatiquement si nécessaire

### 4. **Photos supplémentaires (optionnel)**
- Ajoutez d'autres photos si nécessaire
- Ces photos seront jointes à l'observation

### 5. **Soumission**
- Vérifiez toutes les informations
- Cochez le consentement au contact
- Cliquez sur "Enregistrer l'observation"

## 🎯 Avantages du nouveau workflow

### ⚡ **Gain de temps**
- Remplissage automatique des champs descriptifs
- Moins de saisie manuelle
- Workflow plus fluide

### 🎯 **Précision améliorée**
- L'IA détecte des détails que vous pourriez oublier
- Descriptions standardisées et cohérentes
- Suggestions d'amélioration

### 🔄 **Flexibilité**
- Vous pouvez toujours modifier les champs remplis automatiquement
- Possibilité d'ajouter des photos supplémentaires
- Fonctionnement normal si l'IA n'est pas configurée

## 📱 Interface utilisateur

### Section principale - Analyse d'image
```
┌─────────────────────────────────────────┐
│ 🧠 Analyse intelligente d'image         │
├─────────────────────────────────────────┤
│ [Zone de sélection de photo]            │
│                                         │
│ [Résultats de l'analyse]                │
│                                         │
│ [Configuration Gemini]                  │
└─────────────────────────────────────────┘
```

### Indicateur de remplissage automatique
```
┌─────────────────────────────────────────┐
│ Description de l'observation    ✅ Champs │
│                                 remplis │
│                                 auto.   │
└─────────────────────────────────────────┘
```

## 🔧 Configuration requise

### Pour utiliser l'analyse IA :
1. Obtenez une clé API Gemini sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Ajoutez dans votre fichier `.env` :
   ```env
   VITE_GEMINI_API_KEY=votre_cle_api_gemini_ici
   ```
3. Redémarrez le serveur de développement

### Sans configuration :
- Le formulaire fonctionne normalement
- Vous pouvez remplir manuellement tous les champs
- Un guide de configuration s'affiche pour vous aider

## 💡 Conseils pour de meilleurs résultats

### 📸 **Qualité de l'image**
- Photo claire et bien éclairée
- Personne bien visible
- Distance raisonnable
- Image stable (pas floue)

### 🎯 **Contenu de l'image**
- Personne au centre de l'image
- Vêtements visibles
- Environnement identifiable
- Actions/comportement observable

### ⚙️ **Utilisation optimale**
- Commencez toujours par l'analyse d'image
- Vérifiez les résultats avant de continuer
- Ajustez les champs si nécessaire
- Ajoutez des détails supplémentaires

## 🚨 Limitations et précautions

### ⚠️ **Limitations de l'IA**
- Résultats dépendants de la qualité de l'image
- Possibles erreurs d'interprétation
- Contexte limité de la situation

### ✅ **Bonnes pratiques**
- Toujours vérifier les résultats de l'IA
- Ajouter des détails manuels si nécessaire
- Utiliser des images appropriées et légales
- Respecter la confidentialité des personnes

## 🔄 Workflow de secours

Si l'analyse IA ne fonctionne pas :
1. Continuez avec le formulaire normal
2. Remplissez manuellement les champs descriptifs
3. Ajoutez vos photos dans la section "Photos supplémentaires"
4. Soumettez l'observation normalement

---

**Note** : Cette fonctionnalité est entièrement optionnelle et améliore l'expérience utilisateur sans être obligatoire.
