import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../lib/supabase';
import { MissingPerson, InvestigationObservation, SavedResolutionScenario, User } from '../types';
import { AnalyticsService } from './analytics';

// Configuration de l'API Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data?: any; // Données supplémentaires pour les réponses avec données
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
  isActive: boolean;
  lastMessageContent: string;
  lastMessageRole: string;
  messageCount: number;
}

export interface ChatContext {
  user: User | null;
  currentReport?: MissingPerson;
  currentConversationId?: string;
  availableData: {
    reports: MissingPerson[];
    observations: InvestigationObservation[];
    scenarios: SavedResolutionScenario[];
    analytics?: any;
  };
}

/**
 * Service principal du chatbot avec accès complet à la base de données
 */
export class ChatbotService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  private context: ChatContext;

  constructor(user: User | null = null) {
    this.context = {
      user,
      availableData: {
        reports: [],
        observations: [],
        scenarios: []
      }
    };
  }

  /**
   * Met à jour le contexte utilisateur
   */
  async updateUserContext(user: User | null) {
    console.log('🔧 ChatbotService - Mise à jour du contexte utilisateur:', user ? `${user.firstName} ${user.lastName} (${user.id})` : 'null');
    this.context.user = user;
    if (user) {
      console.log('📊 Chargement des données utilisateur...');
      await this.loadUserData();
      console.log('✅ Données utilisateur chargées');
    } else {
      console.log('🧹 Réinitialisation des données utilisateur');
      this.context.availableData = {
        reports: [],
        observations: [],
        scenarios: []
      };
    }
  }

  /**
   * Charge toutes les données disponibles pour l'utilisateur
   */
  private async loadUserData() {
    try {
      // Charger les signalements (missing_persons)
      const { data: reports, error: reportsError } = await supabase
        .from('missing_persons')
        .select(`
          id,
          first_name,
          last_name,
          age,
          gender,
          photo,
          date_disappeared,
          time_disappeared,
          location_address,
          location_city,
          location_state,
          location_country,
          location_lat,
          location_lng,
          description,
          case_type,
          priority,
          status,
          is_emergency,
          circumstances,
          clothing_description,
          personal_items,
          medical_info,
          behavioral_info,
          last_contact_date,
          reporter_name,
          reporter_relationship,
          reporter_phone,
          reporter_email,
          consent_given,
          created_at,
          updated_at,
          created_by
        `)
        .order('created_at', { ascending: false });

      if (reportsError) {
        console.error('Erreur lors du chargement des signalements:', reportsError);
      }

      // Charger les observations (investigation_observations)
      const { data: observations, error: obsError } = await supabase
        .from('investigation_observations')
        .select(`
          id,
          missing_person_id,
          observer_name,
          observer_phone,
          observer_email,
          observation_date,
          observation_time,
          location_address,
          location_city,
          location_state,
          location_country,
          location_lat,
          location_lng,
          description,
          confidence_level,
          clothing_description,
          behavior_description,
          companions,
          vehicle_info,
          witness_contact_consent,
          is_verified,
          verified_by,
          verified_at,
          photos,
          photo_descriptions,
          created_at,
          updated_at,
          created_by,
          missing_persons!inner(
            id, first_name, last_name, location_lat, location_lng, date_disappeared
          )
        `)
        .order('observation_date', { ascending: false });

      if (obsError) {
        console.error('Erreur lors du chargement des observations:', obsError);
      }

      // Charger les scénarios de résolution (resolution_scenarios)
      const { data: scenarios, error: scenariosError } = await supabase
        .from('resolution_scenarios')
        .select(`
          id,
          missing_person_id,
          scenario1_title,
          scenario1_description,
          scenario1_probability,
          scenario1_actions,
          scenario1_timeline,
          scenario1_key_factors,
          scenario1_resources,
          scenario2_title,
          scenario2_description,
          scenario2_probability,
          scenario2_actions,
          scenario2_timeline,
          scenario2_key_factors,
          scenario2_resources,
          summary,
          recommendations,
          generation_date,
          ai_model_used,
          generation_version,
          created_at,
          updated_at,
          created_by
        `)
        .order('created_at', { ascending: false });

      if (scenariosError) {
        console.error('Erreur lors du chargement des scénarios:', scenariosError);
      }

      this.context.availableData = {
        reports: reports || [],
        observations: observations || [],
        scenarios: scenarios || []
      };

      console.log('📊 Données chargées pour le chatbot:', {
        reports: reports?.length || 0,
        observations: observations?.length || 0,
        scenarios: scenarios?.length || 0
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  }

  /**
   * Obtient toutes les conversations de l'utilisateur
   */
  async getUserConversations(): Promise<ChatConversation[]> {
    console.log('🔍 ChatbotService - getUserConversations appelée');
    console.log('👤 Contexte utilisateur:', this.context.user ? `${this.context.user.firstName} ${this.context.user.lastName} (${this.context.user.id})` : 'null');
    
    if (!this.context.user) {
      console.error('❌ Erreur: Utilisateur non connecté dans le contexte du chatbot');
      throw new Error('Utilisateur non connecté');
    }

    try {
      const { data, error } = await supabase
        .rpc('get_user_conversations_with_last_message', {
          user_uuid: this.context.user.id
        });

      if (error) {
        console.error('Erreur lors de la récupération des conversations:', error);
        throw error;
      }

      return (data || []).map((conv: any) => ({
        id: conv.conversation_id,
        title: conv.title,
        createdAt: new Date(conv.created_at),
        updatedAt: new Date(conv.updated_at),
        lastMessageAt: new Date(conv.last_message_at),
        isActive: conv.is_active,
        lastMessageContent: conv.last_message_content,
        lastMessageRole: conv.last_message_role,
        messageCount: parseInt(conv.message_count)
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      return [];
    }
  }

  /**
   * Obtient les messages d'une conversation
   */
  async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    if (!this.context.user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const { data, error } = await supabase
        .rpc('get_conversation_messages', {
          conv_id: conversationId,
          user_uuid: this.context.user.id
        });

      if (error) {
        console.error('Erreur lors de la récupération des messages:', error);
        throw error;
      }

      return (data || []).map((msg: any) => ({
        id: msg.message_id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at),
        data: msg.metadata
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      return [];
    }
  }

  /**
   * Crée une nouvelle conversation
   */
  async createConversation(title: string = 'Nouvelle conversation'): Promise<string> {
    if (!this.context.user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const { data, error } = await supabase
        .rpc('create_new_conversation', {
          user_uuid: this.context.user.id,
          conversation_title: title
        });

      if (error) {
        console.error('Erreur lors de la création de la conversation:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      throw error;
    }
  }

  /**
   * Change la conversation active
   */
  async setActiveConversation(conversationId: string): Promise<void> {
    if (!this.context.user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      // Désactiver toutes les autres conversations de l'utilisateur
      await supabase
        .from('chatbot_conversations')
        .update({ is_active: false })
        .eq('user_id', this.context.user.id);

      // Activer la conversation sélectionnée
      const { error } = await supabase
        .from('chatbot_conversations')
        .update({ is_active: true })
        .eq('id', conversationId)
        .eq('user_id', this.context.user.id);

      if (error) {
        console.error('Erreur lors du changement de conversation:', error);
        throw error;
      }

      this.context.currentConversationId = conversationId;
    } catch (error) {
      console.error('Erreur lors du changement de conversation:', error);
      throw error;
    }
  }

  /**
   * Sauvegarde un message dans la conversation active
   */
  async saveMessage(message: ChatMessage): Promise<void> {
    if (!this.context.user || !this.context.currentConversationId) {
      console.warn('Impossible de sauvegarder le message: utilisateur non connecté ou conversation non sélectionnée');
      return;
    }

    try {
      await supabase.rpc('add_message_to_conversation', {
        conv_id: this.context.currentConversationId,
        msg_role: message.role,
        msg_content: message.content,
        msg_metadata: message.data || {},
        user_uuid: this.context.user.id
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du message:', error);
    }
  }

  /**
   * Met à jour le titre d'une conversation
   */
  async updateConversationTitle(conversationId: string, title: string): Promise<void> {
    if (!this.context.user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const { error } = await supabase
        .from('chatbot_conversations')
        .update({ title })
        .eq('id', conversationId)
        .eq('user_id', this.context.user.id);

      if (error) {
        console.error('Erreur lors de la mise à jour du titre:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du titre:', error);
      throw error;
    }
  }

  /**
   * Supprime une conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    if (!this.context.user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const { error } = await supabase
        .from('chatbot_conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', this.context.user.id);

      if (error) {
        console.error('Erreur lors de la suppression de la conversation:', error);
        throw error;
      }

      // Si c'était la conversation active, la déselectionner
      if (this.context.currentConversationId === conversationId) {
        this.context.currentConversationId = undefined;
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la conversation:', error);
      throw error;
    }
  }

  /**
   * Traite un message utilisateur et génère une réponse
   */
  async processMessage(message: string): Promise<ChatMessage> {
    // S'assurer qu'une conversation est active
    if (!this.context.currentConversationId) {
      try {
        this.context.currentConversationId = await this.createConversation();
      } catch (error) {
        console.error('Erreur lors de la création de la conversation:', error);
        throw new Error('Impossible de créer une conversation');
      }
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    // Sauvegarder le message utilisateur
    await this.saveMessage(userMessage);

    try {
      // Récupérer l'historique de la conversation
      const conversationMessages = await this.getConversationMessages(this.context.currentConversationId);
      
      // Construire le contexte pour Gemini
      const contextPrompt = this.buildContextPrompt();
      
      // Construire l'historique de conversation (derniers 10 messages)
      const recentMessages = conversationMessages.slice(-10);
      const conversationHistory = recentMessages
        .map(msg => `${msg.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const fullPrompt = `
${contextPrompt}

HISTORIQUE DE CONVERSATION:
${conversationHistory}

MESSAGE ACTUEL DE L'UTILISATEUR: ${message}

INSTRUCTIONS:
- Réponds en français de manière professionnelle et empathique
- Utilise les données disponibles pour donner des réponses précises
- Si tu n'as pas assez d'informations, demande des précisions
- Propose des actions concrètes quand c'est approprié
- Respecte la confidentialité des données personnelles
- Sois utile et informatif

RÉPONSE:`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const assistantContent = response.text();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date()
      };

      // Sauvegarder la réponse de l'assistant
      await this.saveMessage(assistantMessage);

      return assistantMessage;

    } catch (error) {
      console.error('Erreur lors du traitement du message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Désolé, je rencontre une difficulté technique. Pouvez-vous reformuler votre question ?',
        timestamp: new Date()
      };

      // Sauvegarder le message d'erreur
      await this.saveMessage(errorMessage);
      
      return errorMessage;
    }
  }

  /**
   * Construit le prompt de contexte avec toutes les données disponibles
   */
  private buildContextPrompt(): string {
    const { user, availableData } = this.context;
    
    let contextPrompt = `
Tu es un assistant IA spécialisé dans l'aide aux investigations de personnes disparues. Tu as accès à une base de données complète contenant :

UTILISATEUR ACTUEL:
- ${user ? `${user.firstName} ${user.lastName} (${user.role})` : 'Non connecté'}

DONNÉES DISPONIBLES:
`;

    // Informations sur les signalements
    if (availableData.reports.length > 0) {
      contextPrompt += `
SIGNALEMENTS ACTIFS (${availableData.reports.length}):
`;
      availableData.reports.slice(0, 10).forEach((report, index) => {
        const daysSince = Math.floor(
          (new Date().getTime() - new Date(report.date_disappeared).getTime()) / (1000 * 60 * 60 * 24)
        );
        contextPrompt += `
${index + 1}. ${report.first_name} ${report.last_name} (${report.age} ans, ${report.gender === 'male' ? 'Homme' : 'Femme'})
   - Disparu depuis: ${daysSince} jour${daysSince !== 1 ? 's' : ''} (${new Date(report.date_disappeared).toLocaleDateString('fr-FR')})
   - Lieu: ${report.location_city}, ${report.location_state}
   - Type: ${report.case_type}
   - Priorité: ${report.priority}
   - Urgence: ${report.is_emergency ? 'OUI' : 'NON'}
   - Statut: ${report.status}
   - Description: ${report.description.substring(0, 200)}...
`;
      });
    } else {
      contextPrompt += `
SIGNALEMENTS: Aucun signalement actif
`;
    }

    // Informations sur les observations
    if (availableData.observations.length > 0) {
      contextPrompt += `
OBSERVATIONS RÉCENTES (${availableData.observations.length}):
`;
      availableData.observations.slice(0, 15).forEach((obs, index) => {
        contextPrompt += `
${index + 1}. ${obs.observer_name} - ${new Date(obs.observation_date).toLocaleDateString('fr-FR')}
   - Lieu: ${obs.location_city}, ${obs.location_state}
   - Confiance: ${obs.confidence_level}
   - Vérifiée: ${obs.is_verified ? 'OUI' : 'NON'}
   - Description: ${obs.description.substring(0, 150)}...
`;
      });
    } else {
      contextPrompt += `
OBSERVATIONS: Aucune observation disponible
`;
    }

    // Informations sur les scénarios
    if (availableData.scenarios.length > 0) {
      contextPrompt += `
SCÉNARIOS DE RÉSOLUTION (${availableData.scenarios.length}):
`;
      availableData.scenarios.slice(0, 5).forEach((scenario, index) => {
        contextPrompt += `
${index + 1}. Généré le ${new Date(scenario.generation_date).toLocaleDateString('fr-FR')}
   - Scénario 1: ${scenario.scenario1_title} (probabilité: ${scenario.scenario1_probability})
   - Scénario 2: ${scenario.scenario2_title} (probabilité: ${scenario.scenario2_probability})
   - Résumé: ${scenario.summary.substring(0, 200)}...
`;
      });
    } else {
      contextPrompt += `
SCÉNARIOS: Aucun scénario de résolution disponible
`;
    }

    // Statistiques générales
    const activeReports = availableData.reports.filter(r => r.status === 'active').length;
    const verifiedObservations = availableData.observations.filter(o => o.is_verified).length;
    const highConfidenceObservations = availableData.observations.filter(o => o.confidence_level === 'high').length;

    contextPrompt += `
STATISTIQUES GÉNÉRALES:
- Signalements actifs: ${activeReports}
- Observations vérifiées: ${verifiedObservations}
- Observations haute confiance: ${highConfidenceObservations}
- Total observations: ${availableData.observations.length}
- Scénarios générés: ${availableData.scenarios.length}

CAPACITÉS DISPONIBLES:
- Analyser les tendances des observations
- Suggérer des actions d'investigation
- Évaluer la crédibilité des témoignages
- Proposer des scénarios de résolution
- Fournir des statistiques détaillées
- Aider à la coordination des recherches
`;

    return contextPrompt;
  }

  /**
   * Recherche dans les données disponibles
   */
  async searchData(query: string): Promise<any> {
    const results = {
      reports: [] as MissingPerson[],
      observations: [] as InvestigationObservation[],
      scenarios: [] as SavedResolutionScenario[]
    };

    const searchTerm = query.toLowerCase();

    // Recherche dans les signalements
    results.reports = this.context.availableData.reports.filter(report =>
      report.first_name.toLowerCase().includes(searchTerm) ||
      report.last_name.toLowerCase().includes(searchTerm) ||
      report.location_city.toLowerCase().includes(searchTerm) ||
      report.description.toLowerCase().includes(searchTerm) ||
      report.case_type.toLowerCase().includes(searchTerm)
    );

    // Recherche dans les observations
    results.observations = this.context.availableData.observations.filter(obs =>
      obs.observer_name.toLowerCase().includes(searchTerm) ||
      obs.description.toLowerCase().includes(searchTerm) ||
      obs.location_city.toLowerCase().includes(searchTerm) ||
      obs.clothing_description?.toLowerCase().includes(searchTerm) ||
      obs.behavior_description?.toLowerCase().includes(searchTerm)
    );

    // Recherche dans les scénarios
    results.scenarios = this.context.availableData.scenarios.filter(scenario =>
      scenario.scenario1_title.toLowerCase().includes(searchTerm) ||
      scenario.scenario2_title.toLowerCase().includes(searchTerm) ||
      scenario.summary.toLowerCase().includes(searchTerm) ||
      scenario.recommendations.some(rec => rec.toLowerCase().includes(searchTerm))
    );

    return results;
  }

  /**
   * Génère des suggestions d'actions basées sur les données
   */
  async generateActionSuggestions(): Promise<string[]> {
    const suggestions: string[] = [];
    const { reports, observations } = this.context.availableData;

    // Suggestions basées sur les signalements actifs
    const activeReports = reports.filter(r => r.status === 'active');
    if (activeReports.length > 0) {
      suggestions.push(`Il y a ${activeReports.length} signalement(s) actif(s) nécessitant une attention`);
      
      const highPriorityReports = activeReports.filter(r => r.priority === 'high' || r.priority === 'critical');
      if (highPriorityReports.length > 0) {
        suggestions.push(`${highPriorityReports.length} signalement(s) de haute priorité nécessitent une action immédiate`);
      }
    }

    // Suggestions basées sur les observations non vérifiées
    const unverifiedObservations = observations.filter(o => !o.is_verified);
    if (unverifiedObservations.length > 0) {
      suggestions.push(`${unverifiedObservations.length} observation(s) en attente de vérification`);
    }

    // Suggestions basées sur les patterns temporels
    const recentObservations = observations.filter(obs => {
      const obsDate = new Date(obs.observation_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return obsDate >= weekAgo;
    });

    if (recentObservations.length > 5) {
      suggestions.push('Activité d\'observation élevée cette semaine - considérer une coordination renforcée');
    }

    return suggestions;
  }

  /**
   * Charge une conversation existante
   */
  async loadConversation(conversationId: string): Promise<ChatMessage[]> {
    await this.setActiveConversation(conversationId);
    return await this.getConversationMessages(conversationId);
  }

  /**
   * Génère un titre automatique pour une conversation basé sur le premier message
   */
  async generateConversationTitle(firstMessage: string): Promise<string> {
    try {
      const prompt = `
Génère un titre court et descriptif (maximum 50 caractères) pour une conversation de chatbot basée sur ce premier message:

"${firstMessage}"

Le titre doit être en français et décrire le sujet principal de la conversation.

Réponds uniquement avec le titre, sans guillemets ni texte supplémentaire.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const title = response.text().trim().replace(/['"]/g, '');
      
      return title.length > 50 ? title.substring(0, 47) + '...' : title;
    } catch (error) {
      console.error('Erreur lors de la génération du titre:', error);
      return 'Nouvelle conversation';
    }
  }

  /**
   * Met à jour le titre de la conversation active basé sur le premier message
   */
  async updateActiveConversationTitle(firstMessage: string): Promise<void> {
    if (!this.context.currentConversationId) return;

    try {
      const title = await this.generateConversationTitle(firstMessage);
      await this.updateConversationTitle(this.context.currentConversationId, title);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du titre:', error);
    }
  }

  /**
   * Vérifie si Gemini est configuré
   */
  static isConfigured(): boolean {
    return !!import.meta.env.VITE_GEMINI_API_KEY;
  }
}
