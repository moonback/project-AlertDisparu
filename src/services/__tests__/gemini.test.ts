import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeImageWithGemini, isGeminiConfigured } from '../gemini';

// Mock de l'API Gemini
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: vi.fn().mockResolvedValue(JSON.stringify({
            description: "Une personne marchant dans la rue",
            clothingDescription: "Vêtements sombres, jean et veste",
            behaviorDescription: "Marche normale, semble pressé",
            companions: null,
            vehicleInfo: null,
            location: "Rue urbaine avec bâtiments",
            confidence: "medium",
            suggestions: [
              "Essayez de prendre une photo plus proche",
              "Assurez-vous que la personne est bien visible",
              "Ajoutez une description manuelle si nécessaire"
            ]
          }))
        }
      })
    })
  }))
}));

// Mock de l'environnement
const mockEnv = {
  VITE_GEMINI_API_KEY: 'test-api-key'
};

describe('Gemini Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock des variables d'environnement
    vi.stubGlobal('import', {
      meta: {
        env: mockEnv
      }
    });
  });

  describe('isGeminiConfigured', () => {
    it('devrait retourner true si la clé API est configurée', () => {
      expect(isGeminiConfigured()).toBe(true);
    });

    it('devrait retourner false si la clé API n\'est pas configurée', () => {
      vi.stubGlobal('import', {
        meta: {
          env: {}
        }
      });
      expect(isGeminiConfigured()).toBe(false);
    });
  });

  describe('analyzeImageWithGemini', () => {
    it('devrait analyser une image avec succès', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const result = await analyzeImageWithGemini(mockFile, 'John Doe', 'Personne recherchée');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.description).toBe("Une personne marchant dans la rue");
      expect(result.data?.clothingDescription).toBe("Vêtements sombres, jean et veste");
      expect(result.data?.confidence).toBe("medium");
    });

    it('devrait retourner une erreur si la clé API n\'est pas configurée', async () => {
      vi.stubGlobal('import', {
        meta: {
          env: {}
        }
      });

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const result = await analyzeImageWithGemini(mockFile, 'John Doe');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Clé API Gemini non configurée');
    });

    it('devrait gérer les erreurs de parsing JSON', async () => {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: vi.fn().mockResolvedValue('Réponse invalide non-JSON')
          }
        })
      };
      
      (GoogleGenerativeAI as any).mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue(mockModel)
      }));

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const result = await analyzeImageWithGemini(mockFile, 'John Doe');
      
      expect(result.success).toBe(true);
      expect(result.data?.description).toContain('Erreur lors de l\'analyse');
      expect(result.data?.confidence).toBe('low');
    });
  });
});
