import { GoogleGenerativeAI } from '@google/generative-ai';

// Utilise la même clé que le service existant
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface AlertPosterExtraction {
  // Informations sur la victime
  victimName: string | null;
  victimAge: number | null;
  victimGender: 'female' | 'male' | 'other' | null;
  victimEthnicity?: string | null; // caucasien, asiatique, africain, etc.
  
  // Description physique détaillée
  hairColor?: string | null;
  hairLength?: string | null;
  hairStyle?: string | null; // coiffure spécifique
  eyeColor?: string | null;
  heightMeters?: number | null;
  weight?: string | null; // si mentionné
  bodyType?: string | null;
  skinTone?: string | null;
  
  // Vêtements et accessoires
  clothing?: string | null;
  accessories?: string | null; // bijoux, montres, etc.
  shoes?: string | null;
  
  // Signes particuliers
  distinctiveMarks?: string | null;
  scars?: string | null;
  tattoos?: string | null;
  piercings?: string | null;
  
  // Circonstances de l'enlèvement
  abductedAt?: string | null; // ISO datetime si possible
  abductedLocation?: string | null; // adresse/ville précise
  abductedLocationDetails?: string | null; // rue, numéro, etc.
  circumstances?: string | null; // circonstances mentionnées
  
  // Véhicule et suspect
  vehicle?: string | null; // marque, modèle, couleur, immatriculation
  vehicleColor?: string | null;
  vehicleModel?: string | null;
  licensePlate?: string | null;
  suspect?: string | null; // nom et âge du suspect
  suspectAge?: number | null;
  suspectDescription?: string | null; // description physique du suspect
  
  // Informations de contact
  contactPhone?: string | null;
  contactEmail?: string | null;
  contactWebsite?: string | null;
  
  // Informations générales
  description?: string | null;
  alertType?: string | null; // type d'alerte
  alertNumber?: string | null; // numéro d'alerte si présent
  authorities?: string | null; // autorités mentionnées
  urgency?: string | null; // niveau d'urgence
  
  // Métadonnées
  posterDate?: string | null; // date de l'affiche
  posterSource?: string | null; // source de l'affiche
  confidence?: 'low' | 'medium' | 'high'; // niveau de confiance de l'analyse
}

export interface AlertPosterAnalysisResponse {
  success: boolean;
  data?: AlertPosterExtraction;
  error?: string;
}

export async function analyzeAlertPosterWithGemini(imageFile: File): Promise<AlertPosterAnalysisResponse> {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      return { success: false, error: 'Clé API Gemini non configurée. Ajoutez VITE_GEMINI_API_KEY dans votre .env' };
    }

    const base64Image = await fileToBase64(imageFile);
    const prompt = buildAlertPosterPrompt();

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: imageFile.type
      }
    } as const;

    // Stratégie de retry avec backoff exponentiel et fallback de modèle
    const modelsToTry = ['gemini-2.5-flash'];
    const maxAttempts = 3;

    for (const modelName of modelsToTry) {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent([prompt, imagePart]);
          const response = await result.response;
          const text = response.text();
          const parsed = parseAlertPosterResponse(text);
          return { success: true, data: parsed };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          const isOverloaded = /503|overloaded|rate|quota|unavailable/i.test(message);
          const isRetryable = isOverloaded || /ECONNRESET|ETIMEDOUT|network/i.test(message);

          console.warn(`Tentative ${attempt}/${maxAttempts} échouée sur ${modelName}:`, message);

          if (attempt < maxAttempts && isRetryable) {
            const baseDelayMs = 800 * Math.pow(2, attempt - 1);
            const jitter = Math.floor(Math.random() * 200);
            const delay = baseDelayMs + jitter;
            await new Promise((res) => setTimeout(res, delay));
            continue; // réessayer
          }

          // Si non réessayable ou dernière tentative de ce modèle, passer au modèle suivant
          if (attempt === maxAttempts) {
            // Passer au modèle suivant si disponible
            break;
          }
        }
      }
    }

    return { success: false, error: 'Service Gemini temporairement indisponible (surcharge). Merci de réessayer dans quelques secondes.' };
  } catch (error) {
    console.error('Erreur analyse affiche Alerte Enlèvement:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = error => reject(error);
  });
}

function buildAlertPosterPrompt(): string {
  return `
Tu es un expert en extraction d'informations depuis des affiches « Alerte Enlèvement » françaises officielles.
Analyse méticuleusement l'image fournie et extrais TOUTES les informations visibles. Réponds STRICTEMENT par un JSON valide et rien d'autre.

Schéma JSON attendu (extrait TOUTES les informations disponibles):
{
  "victimName": "Prénom Nom complet ou null",
  "victimAge": 12,
  "victimGender": "female|male|other|null",
  "victimEthnicity": "caucasien|asiatique|africain|métis|null",
  
  "hairColor": "brun|châtain|blond|noir|roux|gris|null",
  "hairLength": "court|mi-long|long|null",
  "hairStyle": "coiffure spécifique mentionnée ou null",
  "eyeColor": "marron|bleu|vert|noisette|gris|null",
  "heightMeters": 1.63,
  "weight": "poids mentionné ou null",
  "bodyType": "mince|moyen|fort|athlétique|null",
  "skinTone": "claire|moyenne|foncée|null",
  
  "clothing": "description détaillée des vêtements",
  "accessories": "bijoux, montres, bagues, colliers mentionnés",
  "shoes": "type de chaussures mentionné",
  
  "distinctiveMarks": "signes particuliers généraux",
  "scars": "cicatrices spécifiques mentionnées",
  "tattoos": "tatouages mentionnés",
  "piercings": "piercings mentionnés",
  
  "abductedAt": "2025-09-24T22:30:00+02:00",
  "abductedLocation": "ville principale",
  "abductedLocationDetails": "rue, numéro, quartier précis",
  "circumstances": "circonstances de l'enlèvement mentionnées",
  
  "vehicle": "description complète du véhicule",
  "vehicleColor": "couleur spécifique",
  "vehicleModel": "marque et modèle",
  "licensePlate": "immatriculation exacte",
  "suspect": "nom complet du suspect",
  "suspectAge": 34,
  "suspectDescription": "description physique du suspect",
  
  "contactPhone": "numéro de téléphone d'urgence",
  "contactEmail": "email de contact",
  "contactWebsite": "site web mentionné",
  
  "description": "résumé complet de l'affiche",
  "alertType": "type d'alerte (enlèvement, disparition, etc.)",
  "alertNumber": "numéro d'alerte officiel",
  "authorities": "autorités mentionnées (gendarmerie, police, etc.)",
  "urgency": "niveau d'urgence mentionné",
  
  "posterDate": "date de l'affiche",
  "posterSource": "source/autorité émettrice",
  "confidence": "low|medium|high"
}

INSTRUCTIONS CRITIQUES:
1. LIS TOUT LE TEXTE visible sur l'affiche, même les petits détails
2. Extrait TOUTES les informations numériques (âges, tailles, poids, dates, heures)
3. Note TOUS les détails physiques mentionnés (vêtements, accessoires, signes particuliers)
4. Capture TOUTES les informations de contact (téléphone, email, site web)
5. Identifie TOUS les détails du véhicule (marque, modèle, couleur, immatriculation)
6. Extrait TOUTE la description du suspect si présente
7. Convertis les dates/heures au format ISO quand possible
8. Convertis les hauteurs en mètres (1,63 m -> 1.63)
9. Si une information est absente, mets null
10. Évalue la confiance de ton analyse (high=très claire, medium=correcte, low=floue/partielle)

Sois EXTRÊMEMENT précis et exhaustif dans ton extraction.
`;
}

function parseAlertPosterResponse(text: string): AlertPosterExtraction {
  let clean = text.trim();
  if (clean.startsWith('```json')) clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  else if (clean.startsWith('```')) clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');

  try {
    const parsed = JSON.parse(clean);
    return {
      // Informations sur la victime
      victimName: parsed.victimName ?? null,
      victimAge: typeof parsed.victimAge === 'number' ? parsed.victimAge : (typeof parsed.victimAge === 'string' ? parseInt(parsed.victimAge, 10) || null : null),
      victimGender: parsed.victimGender === 'female' || parsed.victimGender === 'male' || parsed.victimGender === 'other' ? parsed.victimGender : null,
      victimEthnicity: parsed.victimEthnicity ?? null,
      
      // Description physique détaillée
      hairColor: parsed.hairColor ?? null,
      hairLength: parsed.hairLength ?? null,
      hairStyle: parsed.hairStyle ?? null,
      eyeColor: parsed.eyeColor ?? null,
      heightMeters: typeof parsed.heightMeters === 'number' ? parsed.heightMeters : (typeof parsed.heightMeters === 'string' ? parseFloat(parsed.heightMeters.replace(',', '.')) || null : null),
      weight: parsed.weight ?? null,
      bodyType: parsed.bodyType ?? null,
      skinTone: parsed.skinTone ?? null,
      
      // Vêtements et accessoires
      clothing: parsed.clothing ?? null,
      accessories: parsed.accessories ?? null,
      shoes: parsed.shoes ?? null,
      
      // Signes particuliers
      distinctiveMarks: parsed.distinctiveMarks ?? null,
      scars: parsed.scars ?? null,
      tattoos: parsed.tattoos ?? null,
      piercings: parsed.piercings ?? null,
      
      // Circonstances de l'enlèvement
      abductedAt: parsed.abductedAt ?? null,
      abductedLocation: parsed.abductedLocation ?? null,
      abductedLocationDetails: parsed.abductedLocationDetails ?? null,
      circumstances: parsed.circumstances ?? null,
      
      // Véhicule et suspect
      vehicle: parsed.vehicle ?? null,
      vehicleColor: parsed.vehicleColor ?? null,
      vehicleModel: parsed.vehicleModel ?? null,
      licensePlate: parsed.licensePlate ?? null,
      suspect: parsed.suspect ?? null,
      suspectAge: typeof parsed.suspectAge === 'number' ? parsed.suspectAge : (typeof parsed.suspectAge === 'string' ? parseInt(parsed.suspectAge, 10) || null : null),
      suspectDescription: parsed.suspectDescription ?? null,
      
      // Informations de contact
      contactPhone: parsed.contactPhone ?? null,
      contactEmail: parsed.contactEmail ?? null,
      contactWebsite: parsed.contactWebsite ?? null,
      
      // Informations générales
      description: parsed.description ?? null,
      alertType: parsed.alertType ?? null,
      alertNumber: parsed.alertNumber ?? null,
      authorities: parsed.authorities ?? null,
      urgency: parsed.urgency ?? null,
      
      // Métadonnées
      posterDate: parsed.posterDate ?? null,
      posterSource: parsed.posterSource ?? null,
      confidence: ['low', 'medium', 'high'].includes(parsed.confidence) ? parsed.confidence : 'medium'
    };
  } catch {
    console.warn('Parsing JSON affiche échoué, renvoi défaut');
    return {
      victimName: null,
      victimAge: null,
      victimGender: null,
      victimEthnicity: null,
      hairColor: null,
      hairLength: null,
      hairStyle: null,
      eyeColor: null,
      heightMeters: null,
      weight: null,
      bodyType: null,
      skinTone: null,
      clothing: null,
      accessories: null,
      shoes: null,
      distinctiveMarks: null,
      scars: null,
      tattoos: null,
      piercings: null,
      abductedAt: null,
      abductedLocation: null,
      abductedLocationDetails: null,
      circumstances: null,
      vehicle: null,
      vehicleColor: null,
      vehicleModel: null,
      licensePlate: null,
      suspect: null,
      suspectAge: null,
      suspectDescription: null,
      contactPhone: null,
      contactEmail: null,
      contactWebsite: null,
      description: 'Impossible de parser automatiquement le contenu de l\'affiche. Veuillez compléter manuellement.',
      alertType: null,
      alertNumber: null,
      authorities: null,
      urgency: null,
      posterDate: null,
      posterSource: null,
      confidence: 'low'
    };
  }
}

export function isGeminiConfiguredForAlertPoster(): boolean {
  return !!import.meta.env.VITE_GEMINI_API_KEY;
}


