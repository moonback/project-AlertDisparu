import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../lib/supabase';
import { MissingPerson, InvestigationObservation, SavedResolutionScenario, User } from '../types';
import { ChatbotPromptSystem } from './chatbotPrompts';

// Configuration de l'API Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  conversationId?: string; // ID de la conversation
  data?: Record<string, unknown>; // Données supplémentaires pour les réponses avec données
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

// Interfaces pour les données brutes de la base de données
interface RawMissingPerson {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  photo?: string;
  date_disappeared: string;
  time_disappeared?: string;
  location_address?: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  location_lat?: number;
  location_lng?: number;
  description?: string;
  case_type: string;
  priority: string;
  status: string;
  is_emergency: boolean;
  circumstances?: string;
  clothing_description?: string;
  personal_items?: string;
  medical_info?: string;
  behavioral_info?: string;
  last_contact_date?: string;
  reporter_name?: string;
  reporter_relationship?: string;
  reporter_phone?: string;
  reporter_email?: string;
  consent_given?: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface RawInvestigationObservation {
  id: string;
  missing_person_id: string;
  observer_name: string;
  observer_phone?: string;
  observer_email?: string;
  observation_date: string;
  observation_time?: string;
  location_address?: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  location_lat?: number;
  location_lng?: number;
  description?: string;
  confidence_level: string;
  is_verified: boolean;
  clothing_description?: string;
  behavior_description?: string;
  additional_notes?: string;
  photos?: string[];
  witness_contact_consent?: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface RawResolutionScenario {
  id: string;
  missing_person_id: string;
  scenario1_title?: string;
  scenario1_description?: string;
  scenario1_probability?: string;
  scenario1_actions?: string[];
  scenario1_timeline?: string;
  scenario1_key_factors?: string[];
  scenario1_resources?: string[];
  scenario2_title?: string;
  scenario2_description?: string;
  scenario2_probability?: string;
  scenario2_actions?: string[];
  scenario2_timeline?: string;
  scenario2_key_factors?: string[];
  scenario2_resources?: string[];
  summary?: string;
  recommendations?: string[];
  generation_date?: string;
  ai_model_used?: string;
  generation_version?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ChatContext {
  user: User | null;
  currentReport?: MissingPerson;
  currentConversationId?: string;
  availableData: {
    reports: MissingPerson[];
    observations: InvestigationObservation[];
    scenarios: SavedResolutionScenario[];
    analytics?: unknown;
  };
}

/**
 * Service principal du chatbot avec accès complet à la base de données
 */
export class ChatbotService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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
   * Met à jour la conversation active
   */
  setCurrentConversationId(conversationId: string | undefined) {
    this.context.currentConversationId = conversationId;
  }

  /**
   * Obtient l'ID de la conversation active
   */
  getCurrentConversationId(): string | undefined {
    return this.context.currentConversationId;
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
        reports: this.transformReportsData(reports || []),
        observations: this.transformObservationsData(observations || []),
        scenarios: this.transformScenariosData(scenarios || [])
      };

      console.log('📊 Données chargées pour le chatbot:', {
        reports: reports?.length || 0,
        observations: observations?.length || 0,
        scenarios: scenarios?.length || 0
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      this.context.availableData = {
        reports: [],
        observations: [],
        scenarios: []
      };
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

      return (data || []).map((conv: Record<string, unknown>) => ({
        id: conv.conversation_id as string,
        title: conv.title as string,
        createdAt: new Date(conv.created_at as string),
        updatedAt: new Date(conv.updated_at as string),
        lastMessageAt: new Date(conv.last_message_at as string),
        isActive: conv.is_active as boolean,
        lastMessageContent: conv.last_message_content as string,
        lastMessageRole: conv.last_message_role as string,
        messageCount: parseInt(conv.message_count as string)
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
      console.log('🔍 Récupération des messages pour la conversation:', conversationId, 'utilisateur:', this.context.user.id);
      
      const { data, error } = await supabase
        .rpc('get_conversation_messages', {
          conv_id: conversationId,
          user_uuid: this.context.user.id
        });

      if (error) {
        console.error('Erreur lors de la récupération des messages:', error);
        throw error;
      }

      console.log('📊 Données brutes reçues:', data);

      const messages = (data || []).map((msg: Record<string, unknown>) => ({
        id: msg.message_id as string,
        role: msg.role as 'user' | 'assistant',
        content: msg.content as string,
        timestamp: new Date(msg.created_at as string),
        data: msg.metadata as Record<string, unknown>
      }));

      console.log('📨 Messages transformés:', messages);
      return messages;
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
      console.log('🆕 Création d\'une nouvelle conversation:', title, 'pour utilisateur:', this.context.user.id);
      
      const { data, error } = await supabase
        .rpc('create_new_conversation', {
          user_uuid: this.context.user.id,
          conversation_title: title
        });

      if (error) {
        console.error('❌ Erreur lors de la création de la conversation:', error);
        throw error;
      }

      console.log('✅ Nouvelle conversation créée avec l\'ID:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la création de la conversation:', error);
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
      console.log('🔄 Activation de la conversation:', conversationId, 'pour utilisateur:', this.context.user.id);
      
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
        console.error('❌ Erreur lors du changement de conversation:', error);
        throw error;
      }

      this.context.currentConversationId = conversationId;
      console.log('✅ Conversation activée:', conversationId);
    } catch (error) {
      console.error('❌ Erreur lors du changement de conversation:', error);
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
      console.log('💾 Sauvegarde du message:', message.role, message.content.substring(0, 50) + '...', 'dans la conversation:', this.context.currentConversationId);
      console.log('🔍 Contexte utilisateur:', this.context.user?.id);
      
      const result = await supabase.rpc('add_message_to_conversation', {
        conv_id: this.context.currentConversationId,
        msg_role: message.role,
        msg_content: message.content,
        msg_metadata: message.data || {},
        user_uuid: this.context.user.id
      });

      if (result.error) {
        console.error('❌ Erreur lors de la sauvegarde du message:', result.error);
        
        // Si la conversation n'existe pas, essayer de la recréer
        if (result.error.code === 'P0001' && result.error.message.includes('Conversation not found')) {
          console.log('🔄 Tentative de recréation de la conversation...');
          try {
            const newConversationId = await this.createConversation();
            this.context.currentConversationId = newConversationId;
            console.log('✅ Conversation recréée:', newConversationId);
            
            // Réessayer la sauvegarde
            const retryResult = await supabase.rpc('add_message_to_conversation', {
              conv_id: newConversationId,
              msg_role: message.role,
              msg_content: message.content,
              msg_metadata: message.data || {},
              user_uuid: this.context.user.id
            });
            
            if (retryResult.error) {
              console.error('❌ Erreur persistante lors de la sauvegarde:', retryResult.error);
            } else {
              console.log('✅ Message sauvegardé après recréation de conversation:', retryResult.data);
            }
          } catch (retryError) {
            console.error('❌ Erreur lors de la recréation de conversation:', retryError);
          }
        }
      } else {
        console.log('✅ Message sauvegardé avec succès:', result.data);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du message:', error);
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
   * Supprime toutes les conversations de l'utilisateur
   */
  async deleteAllConversations(): Promise<void> {
    if (!this.context.user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const { error } = await supabase
        .from('chatbot_conversations')
        .delete()
        .eq('user_id', this.context.user.id);

      if (error) {
        console.error('Erreur lors de la suppression de toutes les conversations:', error);
        throw error;
      }

      // Réinitialiser la conversation active
      this.context.currentConversationId = undefined;
      console.log('✅ Toutes les conversations ont été supprimées');
    } catch (error) {
      console.error('Erreur lors de la suppression de toutes les conversations:', error);
      throw error;
    }
  }

  /**
   * Traite un message utilisateur et génère une réponse
   */
  async processMessage(message: string): Promise<ChatMessage> {
    console.log('🚀 ProcessMessage appelé avec conversation active:', this.context.currentConversationId);
    console.log('🚀 FORCE LOG - Service version:', new Date().toISOString());
    
    // S'assurer qu'une conversation est active
    if (!this.context.currentConversationId) {
      try {
        console.log('⚠️ Aucune conversation active, création d\'une nouvelle...');
        const newConversationId = await this.createConversation();
        this.context.currentConversationId = newConversationId;
        console.log('✅ Nouvelle conversation créée et définie comme active:', newConversationId);
      } catch (error) {
        console.error('Erreur lors de la création de la conversation:', error);
        throw new Error('Impossible de créer une conversation');
      }
    } else {
      console.log('✅ Conversation active trouvée:', this.context.currentConversationId);
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

      // Détecter le type de demande pour un prompt spécialisé
      const requestType = this.detectRequestType(message);
      const fullPrompt = requestType ? 
        ChatbotPromptSystem.buildSpecializedPrompt(requestType, this.context, message) :
        `
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
        timestamp: new Date(),
        conversationId: this.context.currentConversationId
      };

      console.log('📝 Message assistant créé avec conversationId:', assistantMessage.conversationId);

      // Sauvegarder la réponse de l'assistant
      await this.saveMessage(assistantMessage);

      console.log('📤 Retour du message assistant:', assistantMessage);
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
    
    if (!user) {
      return 'Erreur: Utilisateur non connecté';
    }

    // Utiliser le nouveau système de prompts amélioré
    return ChatbotPromptSystem.buildSystemPrompt(user, availableData);
  }

  /**
   * Recherche dans les données disponibles
   */
  async searchData(query: string): Promise<{
    reports: MissingPerson[];
    observations: InvestigationObservation[];
    scenarios: SavedResolutionScenario[];
  }> {
    const results = {
      reports: [] as MissingPerson[],
      observations: [] as InvestigationObservation[],
      scenarios: [] as SavedResolutionScenario[]
    };

    const searchTerm = query.toLowerCase();

    // Recherche dans les signalements
    results.reports = this.context.availableData.reports.filter(report =>
      report.firstName.toLowerCase().includes(searchTerm) ||
      report.lastName.toLowerCase().includes(searchTerm) ||
      report.locationDisappeared.city.toLowerCase().includes(searchTerm) ||
      report.description.toLowerCase().includes(searchTerm) ||
      report.caseType.toLowerCase().includes(searchTerm)
    );

    // Recherche dans les observations
    results.observations = this.context.availableData.observations.filter(obs =>
      obs.observerName.toLowerCase().includes(searchTerm) ||
      obs.description.toLowerCase().includes(searchTerm) ||
      obs.location.city.toLowerCase().includes(searchTerm) ||
      obs.clothingDescription?.toLowerCase().includes(searchTerm) ||
      obs.behaviorDescription?.toLowerCase().includes(searchTerm)
    );

    // Recherche dans les scénarios
    results.scenarios = this.context.availableData.scenarios.filter(scenario =>
      scenario.scenario1.title.toLowerCase().includes(searchTerm) ||
      scenario.scenario2.title.toLowerCase().includes(searchTerm) ||
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
    const unverifiedObservations = observations.filter(o => !o.isVerified);
    if (unverifiedObservations.length > 0) {
      suggestions.push(`${unverifiedObservations.length} observation(s) en attente de vérification`);
    }

    // Suggestions basées sur les patterns temporels
    const recentObservations = observations.filter(obs => {
      const obsDate = new Date(obs.observationDate);
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
   * Détecte le type de demande pour utiliser un prompt spécialisé
   */
  private detectRequestType(message: string): 'analysis' | 'recommendations' | 'scenarios' | 'statistics' | 'investigation' | null {
    const msg = message.toLowerCase();
    
    // Mots-clés pour l'analyse
    if (msg.includes('analyser') || msg.includes('analyse') || msg.includes('pattern') || 
        msg.includes('tendance') || msg.includes('corrélation') || msg.includes('évaluer')) {
      return 'analysis';
    }
    
    // Mots-clés pour les recommandations
    if (msg.includes('recommand') || msg.includes('suggérer') || msg.includes('conseil') || 
        msg.includes('que faire') || msg.includes('action') || msg.includes('stratégie')) {
      return 'recommendations';
    }
    
    // Mots-clés pour les scénarios
    if (msg.includes('scénario') || msg.includes('probabilité') || msg.includes('possible') || 
        msg.includes('hypothèse') || msg.includes('si') || msg.includes('cas')) {
      return 'scenarios';
    }
    
    // Mots-clés pour les statistiques
    if (msg.includes('statistique') || msg.includes('nombre') || msg.includes('combien') || 
        msg.includes('pourcentage') || msg.includes('moyenne') || msg.includes('total')) {
      return 'statistics';
    }
    
    // Mots-clés pour l'investigation
    if (msg.includes('enquête') || msg.includes('investigation') || msg.includes('recherche') || 
        msg.includes('piste') || msg.includes('coordonner') || msg.includes('équipe')) {
      return 'investigation';
    }
    
    return null;
  }

  /**
   * Transforme les données des signalements de snake_case vers camelCase
   */
  private transformReportsData(data: RawMissingPerson[]): MissingPerson[] {
    console.log('🔄 Transformation des signalements:', data.slice(0, 1)); // Debug
    return data.map(item => ({
      id: item.id,
      firstName: item.first_name,
      lastName: item.last_name,
      age: item.age,
      gender: item.gender as 'male' | 'female' | 'other',
      photo: item.photo,
      dateDisappeared: item.date_disappeared,
      timeDisappeared: item.time_disappeared,
      locationDisappeared: {
        address: item.location_address || '',
        city: item.location_city || '',
        state: item.location_state || '',
        country: item.location_country || '',
        coordinates: {
          lat: item.location_lat || 0,
          lng: item.location_lng || 0
        }
      },
      caseType: item.case_type as 'disappearance' | 'runaway' | 'abduction' | 'missing_adult' | 'missing_child',
      priority: item.priority as 'low' | 'medium' | 'high' | 'critical',
      status: item.status as 'active' | 'found' | 'closed',
      isEmergency: item.is_emergency,
      description: item.description || '',
      physicalDescription: item.circumstances,
      clothingDescription: item.clothing_description,
      lastSeenLocation: item.last_contact_date,
      contactInfo: {
        name: item.reporter_name || '',
        phone: item.reporter_phone || '',
        email: item.reporter_email || '',
        relationship: item.reporter_relationship || ''
      },
      reporterContact: {
        name: item.reporter_name || '',
        phone: item.reporter_phone || '',
        email: item.reporter_email || '',
        relationship: item.reporter_relationship || ''
      },
      consentGiven: item.consent_given || false,
      additionalInfo: item.personal_items,
      createdBy: item.created_by,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  }

  /**
   * Transforme les données des observations de snake_case vers camelCase
   */
  private transformObservationsData(data: RawInvestigationObservation[]): InvestigationObservation[] {
    return data.map(item => ({
      id: item.id,
      missingPersonId: item.missing_person_id,
      observerName: item.observer_name,
      observerPhone: item.observer_phone,
      observerEmail: item.observer_email,
      observationDate: item.observation_date,
      observationTime: item.observation_time,
      location: {
        address: item.location_address || '',
        city: item.location_city || '',
        state: item.location_state || '',
        country: item.location_country || '',
        coordinates: {
          lat: item.location_lat || 0,
          lng: item.location_lng || 0
        }
      },
      description: item.description || '',
      confidenceLevel: item.confidence_level as 'low' | 'medium' | 'high',
      isVerified: item.is_verified,
      clothingDescription: item.clothing_description,
      behaviorDescription: item.behavior_description,
      additionalNotes: item.additional_notes,
      photos: item.photos,
      witnessContactConsent: item.witness_contact_consent || false,
      createdBy: item.created_by,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  }

  /**
   * Transforme les données des scénarios de snake_case vers camelCase
   */
  private transformScenariosData(data: RawResolutionScenario[]): SavedResolutionScenario[] {
    return data.map(item => ({
      id: item.id,
      missingPersonId: item.missing_person_id,
      scenario1: {
        title: item.scenario1_title || '',
        description: item.scenario1_description || '',
        probability: (item.scenario1_probability as 'low' | 'medium' | 'high') || 'medium',
        actions: item.scenario1_actions || [],
        timeline: item.scenario1_timeline || '',
        keyFactors: item.scenario1_key_factors || [],
        resources: item.scenario1_resources || []
      },
      scenario2: {
        title: item.scenario2_title || '',
        description: item.scenario2_description || '',
        probability: (item.scenario2_probability as 'low' | 'medium' | 'high') || 'medium',
        actions: item.scenario2_actions || [],
        timeline: item.scenario2_timeline || '',
        keyFactors: item.scenario2_key_factors || [],
        resources: item.scenario2_resources || []
      },
      summary: item.summary || '',
      recommendations: item.recommendations || [],
      generationDate: item.generation_date || new Date().toISOString(),
      aiModelUsed: item.ai_model_used || 'gemini-pro',
      generationVersion: item.generation_version || '1.0',
      createdBy: item.created_by,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
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
