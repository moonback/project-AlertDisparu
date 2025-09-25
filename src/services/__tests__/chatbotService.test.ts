import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatbotService } from '../chatbotService';
import { supabase } from '../../lib/supabase';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null
        }))
      }))
    }))
  }
}));

// Mock Gemini API
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: vi.fn(() => ({
      generateContent: vi.fn(() => ({
        response: {
          text: () => 'Réponse de test du chatbot'
        }
      }))
    }))
  }))
}));

describe('ChatbotService', () => {
  let chatbotService: ChatbotService;

  beforeEach(() => {
    chatbotService = new ChatbotService();
    vi.clearAllMocks();
  });

  describe('Configuration', () => {
    it('devrait vérifier si Gemini est configuré', () => {
      // Mock de la variable d'environnement
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
      
      expect(ChatbotService.isConfigured()).toBe(true);
    });

    it('devrait retourner false si Gemini n\'est pas configuré', () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');
      
      expect(ChatbotService.isConfigured()).toBe(false);
    });
  });

  describe('Chargement des données', () => {
    it('devrait charger les données de la base selon le schéma fourni', async () => {
      // Mock des données selon votre schéma
      const mockReports = [
        {
          id: '1',
          first_name: 'Jean',
          last_name: 'Dupont',
          age: 25,
          gender: 'male',
          date_disappeared: '2024-01-15',
          location_city: 'Paris',
          location_state: 'Île-de-France',
          case_type: 'disappearance',
          priority: 'high',
          status: 'active',
          is_emergency: false,
          description: 'Personne disparue depuis 3 jours'
        }
      ];

      const mockObservations = [
        {
          id: '1',
          missing_person_id: '1',
          observer_name: 'Marie Martin',
          observation_date: '2024-01-18',
          location_city: 'Paris',
          confidence_level: 'high',
          is_verified: false,
          description: 'Vu dans le métro'
        }
      ];

      const mockScenarios = [
        {
          id: '1',
          missing_person_id: '1',
          scenario1_title: 'Scénario de retour volontaire',
          scenario1_probability: 'medium',
          scenario2_title: 'Scénario d\'enlèvement',
          scenario2_probability: 'low',
          summary: 'Analyse des scénarios possibles'
        }
      ];

      // Mock des réponses Supabase
      const mockFrom = vi.fn();
      const mockSelect = vi.fn();
      const mockOrder = vi.fn();

      mockOrder.mockReturnValueOnce({ data: mockReports, error: null })
              .mockReturnValueOnce({ data: mockObservations, error: null })
              .mockReturnValueOnce({ data: mockScenarios, error: null });

      mockSelect.mockReturnValue({ order: mockOrder });
      mockFrom.mockReturnValue({ select: mockSelect });

      (supabase.from as any).mockImplementation(mockFrom);

      // Test
      await chatbotService.updateUserContext({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'authority'
      });

      // Vérifier que les requêtes ont été faites avec les bons noms de colonnes
      expect(mockFrom).toHaveBeenCalledWith('missing_persons');
      expect(mockFrom).toHaveBeenCalledWith('investigation_observations');
      expect(mockFrom).toHaveBeenCalledWith('resolution_scenarios');
    });
  });

  describe('Recherche dans les données', () => {
    beforeEach(async () => {
      // Mock des données de test
      const mockReports = [
        {
          id: '1',
          first_name: 'Jean',
          last_name: 'Dupont',
          location_city: 'Paris',
          case_type: 'disappearance',
          description: 'Personne disparue'
        }
      ];

      const mockObservations = [
        {
          id: '1',
          observer_name: 'Marie Martin',
          location_city: 'Lyon',
          description: 'Observation importante',
          clothing_description: 'Manteau bleu'
        }
      ];

      // Mock des méthodes de Supabase
      const mockFrom = vi.fn();
      const mockSelect = vi.fn();
      const mockOrder = vi.fn();

      mockOrder.mockReturnValue({ data: [...mockReports, ...mockObservations], error: null });
      mockSelect.mockReturnValue({ order: mockOrder });
      mockFrom.mockReturnValue({ select: mockSelect });

      (supabase.from as any).mockImplementation(mockFrom);

      await chatbotService.updateUserContext({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'authority'
      });
    });

    it('devrait rechercher dans les signalements avec les bons noms de colonnes', async () => {
      const results = await chatbotService.searchData('Jean');
      
      // Vérifier que la recherche fonctionne avec les noms de colonnes du schéma
      expect(results.reports.length).toBeGreaterThan(0);
    });

    it('devrait rechercher dans les observations avec les bons noms de colonnes', async () => {
      const results = await chatbotService.searchData('Marie');
      
      // Vérifier que la recherche fonctionne avec les noms de colonnes du schéma
      expect(results.observations.length).toBeGreaterThan(0);
    });
  });

  describe('Génération de suggestions', () => {
    it('devrait générer des suggestions basées sur les données', async () => {
      // Mock des données avec des observations non vérifiées
      const mockObservations = [
        {
          id: '1',
          observation_date: new Date().toISOString(),
          is_verified: false,
          confidence_level: 'high'
        }
      ];

      const mockReports = [
        {
          id: '1',
          status: 'active',
          priority: 'high',
          is_emergency: false
        }
      ];

      // Mock Supabase
      const mockFrom = vi.fn();
      const mockSelect = vi.fn();
      const mockOrder = vi.fn();

      mockOrder.mockReturnValueOnce({ data: mockReports, error: null })
              .mockReturnValueOnce({ data: mockObservations, error: null })
              .mockReturnValueOnce({ data: [], error: null });

      mockSelect.mockReturnValue({ order: mockOrder });
      mockFrom.mockReturnValue({ select: mockSelect });

      (supabase.from as any).mockImplementation(mockFrom);

      await chatbotService.updateUserContext({
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'authority'
      });

      const suggestions = await chatbotService.generateActionSuggestions();
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('observation'))).toBe(true);
    });
  });

  describe('Traitement des messages', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
    });

    it('devrait traiter un message utilisateur', async () => {
      const response = await chatbotService.processMessage('Bonjour');
      
      expect(response).toBeDefined();
      expect(response.role).toBe('assistant');
      expect(response.content).toBe('Réponse de test du chatbot');
    });

    it('devrait gérer les erreurs de traitement', async () => {
      // Mock une erreur Gemini
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const mockModel = {
        generateContent: vi.fn(() => {
          throw new Error('Erreur API');
        })
      };
      const mockGenAI = {
        getGenerativeModel: vi.fn(() => mockModel)
      };
      (GoogleGenerativeAI as any).mockImplementation(() => mockGenAI);

      const response = await chatbotService.processMessage('Test');
      
      expect(response.role).toBe('assistant');
      expect(response.content).toContain('difficulté technique');
    });
  });
});
