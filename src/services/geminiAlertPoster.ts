import { GoogleGenerativeAI } from '@google/generative-ai';

// Utilise la même clé que le service existant
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface AlertPosterExtraction {
  victimName: string | null;
  victimAge: number | null;
  victimGender: 'female' | 'male' | 'other' | null;
  hairColor?: string | null;
  hairLength?: string | null;
  eyeColor?: string | null;
  heightMeters?: number | null;
  bodyType?: string | null;
  clothing?: string | null;
  distinctiveMarks?: string | null;
  description?: string | null;
  abductedAt?: string | null; // ISO datetime si possible
  abductedLocation?: string | null; // adresse/ville
  vehicle?: string | null; // marque, modèle, couleur, immatriculation
  suspect?: string | null; // nom, âge
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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = buildAlertPosterPrompt();

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: imageFile.type
      }
    } as const;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    const parsed = parseAlertPosterResponse(text);
    return { success: true, data: parsed };
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
Tu es un expert en extraction d'informations depuis des affiches « Alerte Enlèvement » françaises.
Analyse l'image fournie. Réponds STRICTEMENT par un JSON valide et rien d'autre.

Schéma JSON attendu:
{
  "victimName": "Prénom Nom ou null",
  "victimAge": 12,
  "victimGender": "female|male|other|null",
  "hairColor": "brun|châtain|blond|noir|roux|null",
  "hairLength": "court|mi-long|long|null",
  "eyeColor": "marron|bleu|vert|noisette|null",
  "heightMeters": 1.63,
  "bodyType": "mince|moyen|fort|null",
  "clothing": "texte libre ou null",
  "distinctiveMarks": "texte libre ou null",
  "description": "résumé libre de l'affiche ou null",
  "abductedAt": "2025-09-24T22:30:00+02:00" ,
  "abductedLocation": "ville/adresse/commune",
  "vehicle": "marque modèle couleur immatriculation si présent, sinon null",
  "suspect": "nom et âge du suspect ou null"
}

Règles:
- Si l'information est absente ou ambiguë, mets null.
- Convertis l'âge en nombre si possible.
- Convertis les hauteurs en mètres (ex: 1,63 m -> 1.63).
- Si une date/heure est présente, renvoie au format ISO si possible; sinon null.
`;
}

function parseAlertPosterResponse(text: string): AlertPosterExtraction {
  let clean = text.trim();
  if (clean.startsWith('```json')) clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  else if (clean.startsWith('```')) clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');

  try {
    const parsed = JSON.parse(clean);
    return {
      victimName: parsed.victimName ?? null,
      victimAge: typeof parsed.victimAge === 'number' ? parsed.victimAge : (typeof parsed.victimAge === 'string' ? parseInt(parsed.victimAge, 10) || null : null),
      victimGender: parsed.victimGender === 'female' || parsed.victimGender === 'male' || parsed.victimGender === 'other' ? parsed.victimGender : null,
      hairColor: parsed.hairColor ?? null,
      hairLength: parsed.hairLength ?? null,
      eyeColor: parsed.eyeColor ?? null,
      heightMeters: typeof parsed.heightMeters === 'number' ? parsed.heightMeters : (typeof parsed.heightMeters === 'string' ? parseFloat(parsed.heightMeters.replace(',', '.')) || null : null),
      bodyType: parsed.bodyType ?? null,
      clothing: parsed.clothing ?? null,
      distinctiveMarks: parsed.distinctiveMarks ?? null,
      description: parsed.description ?? null,
      abductedAt: parsed.abductedAt ?? null,
      abductedLocation: parsed.abductedLocation ?? null,
      vehicle: parsed.vehicle ?? null,
      suspect: parsed.suspect ?? null
    };
  } catch (e) {
    console.warn('Parsing JSON affiche échoué, renvoi défaut');
    return {
      victimName: null,
      victimAge: null,
      victimGender: null,
      description: 'Impossible de parser automatiquement le contenu de l\'affiche. Veuillez compléter manuellement.',
      hairColor: null,
      hairLength: null,
      eyeColor: null,
      heightMeters: null,
      bodyType: null,
      clothing: null,
      distinctiveMarks: null,
      abductedAt: null,
      abductedLocation: null,
      vehicle: null,
      suspect: null
    };
  }
}

export function isGeminiConfiguredForAlertPoster(): boolean {
  return !!import.meta.env.VITE_GEMINI_API_KEY;
}


