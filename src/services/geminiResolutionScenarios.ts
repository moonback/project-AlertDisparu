import { GoogleGenerativeAI } from '@google/generative-ai';
import { MissingPerson, InvestigationObservation, SavedResolutionScenario } from '../types';
import { useMissingPersonsStore } from '../store/missingPersonsStore';

// Configuration de l'API Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface GeminiResolutionScenario {
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  actions: string[];
  timeline: string;
  keyFactors: string[];
  resources: string[];
}

export interface ResolutionScenariosResponse {
  success: boolean;
  data?: {
    scenario1: GeminiResolutionScenario;
    scenario2: GeminiResolutionScenario;
    summary: string;
    recommendations: string[];
  };
  error?: string;
  savedScenarioId?: string; // ID du scénario sauvegardé en BDD
}

/**
 * Génère 2 scénarios de résolution possibles pour un cas de personne disparue
 * en utilisant toutes les informations disponibles dans la base de données
 */
export async function generateResolutionScenarios(
  report: MissingPerson,
  observations: InvestigationObservation[]
): Promise<ResolutionScenariosResponse> {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      return {
        success: false,
        error: 'Clé API Gemini non configurée. Veuillez ajouter VITE_GEMINI_API_KEY dans votre fichier .env'
      };
    }

    // Initialiser le modèle Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Construire le prompt avec toutes les informations disponibles
    const prompt = buildResolutionPrompt(report, observations);
    
    // Effectuer la génération
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parser la réponse JSON
    const scenariosData = parseResolutionResponse(text);
    
    // Sauvegarder les scénarios en base de données
    try {
      const store = useMissingPersonsStore.getState();
      const scenarioToSave = {
        missingPersonId: report.id,
        scenario1: scenariosData.scenario1,
        scenario2: scenariosData.scenario2,
        summary: scenariosData.summary,
        recommendations: scenariosData.recommendations
      };
      
      const saveResult = await store.addResolutionScenario(scenarioToSave);
      
      if (saveResult.success) {
        return {
          success: true,
          data: scenariosData,
          savedScenarioId: saveResult.id
        };
      } else {
        console.warn('⚠️ Erreur lors de la sauvegarde des scénarios:', saveResult.error);
        return {
          success: true,
          data: scenariosData,
          error: `Scénarios générés mais non sauvegardés: ${saveResult.error}`
        };
      }
    } catch (saveError) {
      console.warn('⚠️ Erreur lors de la sauvegarde des scénarios:', saveError);
      return {
        success: true,
        data: scenariosData,
        error: `Scénarios générés mais non sauvegardés: ${saveError}`
      };
    }
    
  } catch (error) {
    console.error('Erreur lors de la génération des scénarios:', error);
    return {
      success: false,
      error: `Erreur lors de la génération des scénarios: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    };
  }
}

/**
 * Construit le prompt pour la génération de scénarios de résolution
 */
function buildResolutionPrompt(report: MissingPerson, observations: InvestigationObservation[]): string {
  const daysSinceMissing = Math.floor(
    (new Date().getTime() - new Date(report.dateDisappeared).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Construire le résumé des observations
  const observationsSummary = observations.length > 0 
    ? observations.map(obs => {
        const distance = obs.distanceFromDisappearance ? `${obs.distanceFromDisappearance.toFixed(1)} km` : 'distance inconnue';
        return `- ${new Date(obs.observationDate).toLocaleDateString('fr-FR')} à ${obs.location.city}: ${obs.description} (confiance: ${obs.confidenceLevel}, distance: ${distance})`;
      }).join('\n')
    : 'Aucune observation disponible';

  return `
Tu es un expert en investigation de personnes disparues avec une expertise en analyse de cas et génération de scénarios de résolution.

Analyse ce cas de personne disparue et génère 2 scénarios de résolution possibles basés sur toutes les informations disponibles.

INFORMATIONS DU CAS:
- Nom: ${report.firstName} ${report.lastName}
- Âge: ${report.age} ans
- Genre: ${report.gender === 'male' ? 'Homme' : report.gender === 'female' ? 'Femme' : 'Autre'}
- Type de cas: ${report.caseType}
- Priorité: ${report.priority}
- Urgence: ${report.isEmergency ? 'OUI' : 'NON'}
- Disparu depuis: ${daysSinceMissing} jour${daysSinceMissing !== 1 ? 's' : ''}
- Date de disparition: ${new Date(report.dateDisappeared).toLocaleDateString('fr-FR')}
- Heure de disparition: ${report.timeDisappeared || 'Non spécifiée'}
- Lieu de disparition: ${report.locationDisappeared.address}, ${report.locationDisappeared.city}, ${report.locationDisappeared.state}

DESCRIPTION ET CIRCONSTANCES:
- Description: ${report.description}
- Circonstances: ${report.circumstances || 'Non spécifiées'}
- Vêtements portés: ${report.clothingDescription || 'Non spécifiés'}
- Objets personnels: ${report.personalItems || 'Non spécifiés'}
- Informations médicales: ${report.medicalInfo || 'Aucune'}
- Informations comportementales: ${report.behavioralInfo || 'Aucune'}

OBSERVATIONS ET TÉMOIGNAGES (${observations.length} au total):
${observationsSummary}

INSTRUCTIONS:
Génère 2 scénarios de résolution différents et réalistes basés sur ces informations. Chaque scénario doit être plausible et tenir compte des éléments disponibles.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte supplémentaire:

{
  "scenario1": {
    "title": "Titre du premier scénario",
    "description": "Description détaillée du scénario et de ce qui pourrait s'être passé",
    "probability": "low|medium|high",
    "actions": ["action1", "action2", "action3"],
    "timeline": "Estimation du temps nécessaire pour résoudre ce scénario",
    "keyFactors": ["facteur1", "facteur2", "facteur3"],
    "resources": ["ressource1", "ressource2", "ressource3"]
  },
  "scenario2": {
    "title": "Titre du deuxième scénario",
    "description": "Description détaillée du scénario et de ce qui pourrait s'être passé",
    "probability": "low|medium|high",
    "actions": ["action1", "action2", "action3"],
    "timeline": "Estimation du temps nécessaire pour résoudre ce scénario",
    "keyFactors": ["facteur1", "facteur2", "facteur3"],
    "resources": ["ressource1", "ressource2", "ressource3"]
  },
  "summary": "Résumé général de l'analyse et des perspectives",
  "recommendations": ["recommandation1", "recommandation2", "recommandation3"]
}

CRITÈRES IMPORTANTS:
- Les scénarios doivent être réalistes et basés sur les données disponibles
- Considère le type de cas (disparition, fugue, enlèvement, etc.)
- Prends en compte l'âge, le profil et les circonstances
- Analyse les observations existantes et leur crédibilité
- Propose des actions concrètes et réalisables
- Évalue la probabilité de chaque scénario
- Inclus des facteurs clés et ressources nécessaires
- Sois professionnel et respectueux dans l'analyse
`;
}

/**
 * Parse la réponse de Gemini et valide le JSON
 */
function parseResolutionResponse(text: string): {
  scenario1: GeminiResolutionScenario;
  scenario2: GeminiResolutionScenario;
  summary: string;
  recommendations: string[];
} {
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
    
    // Valider la structure
    if (!parsed.scenario1 || !parsed.scenario2) {
      throw new Error('Structure de réponse invalide');
    }
    
    return {
      scenario1: {
        title: parsed.scenario1.title || 'Scénario 1',
        description: parsed.scenario1.description || 'Description non disponible',
        probability: ['low', 'medium', 'high'].includes(parsed.scenario1.probability) ? parsed.scenario1.probability : 'medium',
        actions: Array.isArray(parsed.scenario1.actions) ? parsed.scenario1.actions : [],
        timeline: parsed.scenario1.timeline || 'Non spécifiée',
        keyFactors: Array.isArray(parsed.scenario1.keyFactors) ? parsed.scenario1.keyFactors : [],
        resources: Array.isArray(parsed.scenario1.resources) ? parsed.scenario1.resources : []
      },
      scenario2: {
        title: parsed.scenario2.title || 'Scénario 2',
        description: parsed.scenario2.description || 'Description non disponible',
        probability: ['low', 'medium', 'high'].includes(parsed.scenario2.probability) ? parsed.scenario2.probability : 'medium',
        actions: Array.isArray(parsed.scenario2.actions) ? parsed.scenario2.actions : [],
        timeline: parsed.scenario2.timeline || 'Non spécifiée',
        keyFactors: Array.isArray(parsed.scenario2.keyFactors) ? parsed.scenario2.keyFactors : [],
        resources: Array.isArray(parsed.scenario2.resources) ? parsed.scenario2.resources : []
      },
      summary: parsed.summary || 'Analyse en cours...',
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
    };
    
  } catch (error) {
    console.error('Erreur lors du parsing de la réponse Gemini:', error);
    console.error('Texte reçu:', text);
    
    // Retourner une réponse par défaut en cas d'erreur de parsing
    return {
      scenario1: {
        title: 'Scénario de recherche active',
        description: 'Scénario basé sur une recherche active et coordonnée avec les autorités locales.',
        probability: 'medium',
        actions: [
          'Coordonner avec les forces de l\'ordre',
          'Mobiliser les bénévoles pour la recherche',
          'Diffuser l\'information via les médias'
        ],
        timeline: '1-2 semaines',
        keyFactors: ['Coopération des autorités', 'Mobilisation communautaire', 'Couverture médiatique'],
        resources: ['Forces de l\'ordre', 'Bénévoles', 'Médias locaux']
      },
      scenario2: {
        title: 'Scénario de retour volontaire',
        description: 'Scénario basé sur un retour volontaire de la personne disparue.',
        probability: 'low',
        actions: [
          'Maintenir les canaux de communication ouverts',
          'Surveiller les réseaux sociaux',
          'Coordonner avec les proches'
        ],
        timeline: 'Variable',
        keyFactors: ['Motivation personnelle', 'Soutien familial', 'Circonstances personnelles'],
        resources: ['Famille et amis', 'Conseillers', 'Services sociaux']
      },
      summary: 'Analyse des scénarios basée sur les informations disponibles. Recommandation de poursuivre les investigations.',
      recommendations: [
        'Maintenir la coordination avec les autorités',
        'Continuer la mobilisation communautaire',
        'Suivre toutes les pistes disponibles'
      ]
    };
  }
}

/**
 * Vérifie si l'API Gemini est configurée
 */
export function isGeminiConfiguredForScenarios(): boolean {
  return !!import.meta.env.VITE_GEMINI_API_KEY;
}
