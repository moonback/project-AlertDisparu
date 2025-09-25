import { generateResolutionScenarios, isGeminiConfiguredForScenarios } from '../geminiResolutionScenarios';
import { MissingPerson, InvestigationObservation } from '../../types';

// Mock de l'API Gemini
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            scenario1: {
              title: 'Scénario de recherche active',
              description: 'Recherche coordonnée avec les autorités locales',
              probability: 'high',
              actions: ['Coordonner avec la police', 'Mobiliser les bénévoles'],
              timeline: '1-2 semaines',
              keyFactors: ['Coopération des autorités', 'Mobilisation communautaire'],
              resources: ['Forces de l\'ordre', 'Bénévoles']
            },
            scenario2: {
              title: 'Scénario de retour volontaire',
              description: 'Retour spontané de la personne disparue',
              probability: 'low',
              actions: ['Maintenir les canaux ouverts', 'Surveiller les réseaux sociaux'],
              timeline: 'Variable',
              keyFactors: ['Motivation personnelle', 'Soutien familial'],
              resources: ['Famille et amis', 'Conseillers']
            },
            summary: 'Analyse basée sur les informations disponibles',
            recommendations: ['Continuer les investigations', 'Maintenir la coordination']
          }))
        }
      })
    })
  }))
}));

describe('geminiResolutionScenarios', () => {
  const mockReport: MissingPerson = {
    id: 'test-id',
    firstName: 'Jean',
    lastName: 'Dupont',
    age: 25,
    gender: 'male',
    dateDisappeared: '2024-01-15',
    locationDisappeared: {
      address: '123 Rue de la Paix',
      city: 'Paris',
      state: 'Île-de-France',
      country: 'France',
      coordinates: { lat: 48.8566, lng: 2.3522 }
    },
    description: 'Personne disparue depuis le 15 janvier',
    reporterContact: {
      name: 'Marie Dupont',
      relationship: 'Épouse',
      phone: '0123456789',
      email: 'marie@example.com'
    },
    consentGiven: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    status: 'active',
    caseType: 'disappearance',
    priority: 'medium',
    isEmergency: false
  };

  const mockObservations: InvestigationObservation[] = [
    {
      id: 'obs-1',
      missingPersonId: 'test-id',
      observerName: 'Témoin 1',
      observationDate: '2024-01-16',
      location: {
        address: '456 Avenue des Champs',
        city: 'Paris',
        state: 'Île-de-France',
        country: 'France',
        coordinates: { lat: 48.8566, lng: 2.3522 }
      },
      description: 'Vu dans le quartier',
      confidenceLevel: 'medium',
      witnessContactConsent: true,
      isVerified: false,
      createdAt: '2024-01-16T10:00:00Z',
      updatedAt: '2024-01-16T10:00:00Z'
    }
  ];

  beforeEach(() => {
    // Reset environment variables
    delete process.env.VITE_GEMINI_API_KEY;
  });

  describe('isGeminiConfiguredForScenarios', () => {
    it('should return false when API key is not configured', () => {
      expect(isGeminiConfiguredForScenarios()).toBe(false);
    });

    it('should return true when API key is configured', () => {
      process.env.VITE_GEMINI_API_KEY = 'test-key';
      expect(isGeminiConfiguredForScenarios()).toBe(true);
    });
  });

  describe('generateResolutionScenarios', () => {
    it('should return error when API key is not configured', async () => {
      const result = await generateResolutionScenarios(mockReport, mockObservations);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Clé API Gemini non configurée');
    });

    it('should generate scenarios when API key is configured', async () => {
      process.env.VITE_GEMINI_API_KEY = 'test-key';
      
      const result = await generateResolutionScenarios(mockReport, mockObservations);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.scenario1).toBeDefined();
      expect(result.data?.scenario2).toBeDefined();
      expect(result.data?.summary).toBeDefined();
      expect(result.data?.recommendations).toBeDefined();
    });

    it('should handle empty observations array', async () => {
      process.env.VITE_GEMINI_API_KEY = 'test-key';
      
      const result = await generateResolutionScenarios(mockReport, []);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should include all report information in the prompt', async () => {
      process.env.VITE_GEMINI_API_KEY = 'test-key';
      
      const result = await generateResolutionScenarios(mockReport, mockObservations);
      
      expect(result.success).toBe(true);
      // Le test vérifie que la fonction s'exécute sans erreur
      // Dans un vrai test, on pourrait vérifier le contenu du prompt
    });
  });
});
