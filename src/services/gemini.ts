import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuration de l'API Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface ImageAnalysisResult {
  description: string;
  clothingDescription?: string;
  behaviorDescription?: string;
  companions?: string;
  vehicleInfo?: string;
  location?: string;
  confidence: 'low' | 'medium' | 'high';
  suggestions: string[];
}

export interface GeminiAnalysisResponse {
  success: boolean;
  data?: ImageAnalysisResult;
  error?: string;
}

/**
 * Analyse une image avec Gemini pour extraire des informations utiles
 * pour remplir automatiquement les champs d'observation
 */
export async function analyzeImageWithGemini(
  imageFile: File,
  missingPersonName: string,
  missingPersonDescription?: string
): Promise<GeminiAnalysisResponse> {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      return {
        success: false,
        error: 'Clé API Gemini non configurée. Veuillez ajouter VITE_GEMINI_API_KEY dans votre fichier .env'
      };
    }

    // Convertir l'image en base64
    const base64Image = await fileToBase64(imageFile);
    
    // Initialiser le modèle Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Construire le prompt pour l'analyse
    const prompt = buildAnalysisPrompt(missingPersonName, missingPersonDescription);
    
    // Préparer les données pour Gemini
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: imageFile.type
      }
    };

    // Effectuer l'analyse
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Parser la réponse JSON
    const analysisData = parseGeminiResponse(text);
    
    return {
      success: true,
      data: analysisData
    };
    
  } catch (error) {
    console.error('Erreur lors de l\'analyse Gemini:', error);
    return {
      success: false,
      error: `Erreur lors de l'analyse de l'image: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    };
  }
}

/**
 * Convertit un fichier image en base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      // Retirer le préfixe data:image/...;base64,
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * Construit le prompt pour l'analyse Gemini
 */
function buildAnalysisPrompt(missingPersonName: string, missingPersonDescription?: string): string {
  return `
Tu es un assistant spécialisé dans l'analyse d'images pour aider à retrouver des personnes disparues. 
Analyse cette image et fournis des informations détaillées qui pourraient aider à identifier si cette personne correspond à ${missingPersonName}.

${missingPersonDescription ? `Description de la personne recherchée: ${missingPersonDescription}` : ''}

IMPORTANT: Réponds UNIQUEMENT avec un objet JSON valide, sans texte supplémentaire. Voici le format attendu:

{
  "description": "Description générale de ce que tu vois dans l'image",
  "clothingDescription": "Description détaillée des vêtements, chaussures, accessoires visibles",
  "behaviorDescription": "Description du comportement ou des actions observées",
  "companions": "Description des autres personnes présentes dans l'image",
  "vehicleInfo": "Description d'un véhicule visible dans l'image",
  "location": "Description de l'environnement/lieu visible dans l'image",
  "confidence": "low|medium|high",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}

Instructions spécifiques:
- Si un champ n'est pas visible ou applicable, utilise null
- Pour "confidence": évalue la qualité et la clarté de l'image (low=floue/partielle, medium=correcte, high=très claire)
- Pour "suggestions": propose 3 suggestions utiles pour améliorer l'observation
- Sois précis et factuel dans tes descriptions
- Concentre-toi sur les détails qui pourraient aider à identifier la personne
`;
}

/**
 * Parse la réponse de Gemini et valide le JSON
 */
function parseGeminiResponse(text: string): ImageAnalysisResult {
  try {
    // Nettoyer la réponse (enlever le markdown si présent)
    let cleanText = text.trim();
    
    // Enlever les backticks markdown si présents
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Parser le JSON
    const parsed = JSON.parse(cleanText);
    
    // Valider et formater la réponse
    return {
      description: parsed.description || 'Aucune description disponible',
      clothingDescription: parsed.clothingDescription || undefined,
      behaviorDescription: parsed.behaviorDescription || undefined,
      companions: parsed.companions || undefined,
      vehicleInfo: parsed.vehicleInfo || undefined,
      location: parsed.location || undefined,
      confidence: ['low', 'medium', 'high'].includes(parsed.confidence) ? parsed.confidence : 'medium',
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
    };
    
  } catch (error) {
    console.error('Erreur lors du parsing de la réponse Gemini:', error);
    console.error('Texte reçu:', text);
    
    // Retourner une réponse par défaut en cas d'erreur de parsing
    return {
      description: 'Erreur lors de l\'analyse de l\'image. Veuillez vérifier le contenu manuellement.',
      confidence: 'low',
      suggestions: [
        'Vérifiez que l\'image est claire et bien éclairée',
        'Assurez-vous que la personne est bien visible dans l\'image',
        'Ajoutez une description manuelle si nécessaire'
      ]
    };
  }
}

/**
 * Vérifie si l'API Gemini est configurée
 */
export function isGeminiConfigured(): boolean {
  return !!import.meta.env.VITE_GEMINI_API_KEY;
}
