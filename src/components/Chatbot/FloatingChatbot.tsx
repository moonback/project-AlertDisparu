import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, HelpCircle, Database, MessageSquare, Menu } from 'lucide-react';
import { ChatbotService, ChatMessage } from '../../services/chatbotService';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';
import { QuickSuggestions } from './QuickSuggestions';
import { ChatMessage as ChatMessageComponent } from './ChatMessage';
import { DataInsights } from './DataInsights';
import { ConversationList } from './ConversationList';

interface FloatingChatbotProps {
  className?: string;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDataInsights, setShowDataInsights] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [chatbotService] = useState(() => new ChatbotService());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, loading: authLoading } = useAuth();

  // Initialiser le service avec l'utilisateur
  useEffect(() => {
    console.log('🔄 Mise à jour du contexte utilisateur:', user);
    if (user) {
      chatbotService.updateUserContext(user);
      console.log('✅ Utilisateur configuré dans le chatbot:', user.id);
    } else {
      // Réinitialiser le service si l'utilisateur se déconnecte
      chatbotService.updateUserContext(null);
      setMessages([]);
      setActiveConversationId(undefined);
      setIsFirstMessage(true);
      console.log('❌ Utilisateur déconnecté du chatbot');
    }
  }, [user, chatbotService]);

  // Auto-scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus sur l'input quand la chatbox s'ouvre
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !user) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setShowSuggestions(false);
    setShowDataInsights(false);
    setShowConversations(false);
    setIsLoading(true);

    try {
      const response = await chatbotService.processMessage(userMessage);
      setMessages(prev => [...prev, response]);
      
      // Si c'est le premier message, générer un titre pour la conversation
      if (isFirstMessage) {
        setIsFirstMessage(false);
        // Attendre un peu avant de générer le titre pour que le message soit sauvegardé
        setTimeout(async () => {
          try {
            await chatbotService.updateActiveConversationTitle(userMessage);
          } catch (error) {
            console.error('Erreur lors de la génération du titre:', error);
          }
        }, 1000);
      }
      
      // Mettre à jour l'ID de conversation active
      if (!activeConversationId) {
        setActiveConversationId(chatbotService.context.currentConversationId);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    setShowDataInsights(false);
    setShowConversations(false);
    inputRef.current?.focus();
  };

  const handleInsightClick = (insight: string) => {
    setInputValue(insight);
    setShowSuggestions(false);
    setShowDataInsights(false);
    setShowConversations(false);
    inputRef.current?.focus();
  };

  const handleNewConversation = async () => {
    try {
      setMessages([]);
      setActiveConversationId(undefined);
      setIsFirstMessage(true);
      setShowConversations(false);
      setShowSuggestions(true);
      setShowDataInsights(false);
      
      // Créer une nouvelle conversation
      const newConversationId = await chatbotService.createConversation();
      setActiveConversationId(newConversationId);
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
    }
  };

  const handleConversationSelect = async (conversationId: string) => {
    try {
      setActiveConversationId(conversationId);
      setShowConversations(false);
      
      // Charger les messages de la conversation
      const conversationMessages = await chatbotService.loadConversation(conversationId);
      setMessages(conversationMessages);
      setIsFirstMessage(conversationMessages.length <= 1);
    } catch (error) {
      console.error('Erreur lors du chargement de la conversation:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const clearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
    chatbotService.clearHistory();
  };

  const toggleSuggestions = () => {
    setShowSuggestions(!showSuggestions);
    setShowDataInsights(false);
    setShowConversations(false);
  };

  const toggleDataInsights = () => {
    setShowDataInsights(!showDataInsights);
    setShowSuggestions(false);
    setShowConversations(false);
  };

  const toggleConversations = () => {
    setShowConversations(!showConversations);
    setShowSuggestions(false);
    setShowDataInsights(false);
  };

  // Message d'accueil
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Bonjour${user ? ` ${user.firstName}` : ''} ! 👋

Je suis votre assistant IA spécialisé dans les investigations de personnes disparues. Je peux vous aider avec :

🔍 **Analyse des signalements** - Examiner les cas actifs et leurs détails
📊 **Statistiques et tendances** - Analyser les patterns d'observations  
🎯 **Suggestions d'actions** - Proposer des stratégies d'investigation
📈 **Évaluation de crédibilité** - Analyser la fiabilité des témoignages
🤖 **Génération de scénarios** - Créer des hypothèses de résolution

Que puis-je faire pour vous aider aujourd'hui ?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, user]);

  if (!ChatbotService.isConfigured()) {
    return null; // Ne pas afficher le chatbot si Gemini n'est pas configuré
  }

  // Attendre que l'authentification soit chargée
  if (authLoading) {
    return (
      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <MessageCircle size={20} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Assistant IA</p>
              <p className="text-xs text-gray-500">Chargement...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <MessageCircle size={20} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Assistant IA</p>
              <p className="text-xs text-gray-500">Connectez-vous pour utiliser le chatbot</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      {/* Bouton flottant */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Ouvrir le chatbot"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Interface de chat */}
      {isOpen && (
        <div className={cn(
          "bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300",
          isMinimized ? "w-80 h-12" : showConversations ? "w-[500px] h-[600px]" : "w-[420px] h-[600px]"
        )}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot size={20} />
              <span className="font-semibold">Assistant IA</span>
              {user && (
                <span className="text-blue-200 text-sm">({user.role})</span>
              )}
              {/* Debug info */}
              <span className="text-blue-200 text-xs">
                {chatbotService.context.user ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {!isMinimized && (
                <>
                  <button
                    onClick={toggleConversations}
                    className={cn(
                      "text-blue-200 hover:text-white transition-colors",
                      showConversations && "text-white"
                    )}
                    aria-label="Afficher les conversations"
                  >
                    <MessageSquare size={16} />
                  </button>
                  <button
                    onClick={toggleSuggestions}
                    className={cn(
                      "text-blue-200 hover:text-white transition-colors",
                      showSuggestions && "text-white"
                    )}
                    aria-label="Afficher les suggestions"
                  >
                    <HelpCircle size={16} />
                  </button>
                  <button
                    onClick={toggleDataInsights}
                    className={cn(
                      "text-blue-200 hover:text-white transition-colors",
                      showDataInsights && "text-white"
                    )}
                    aria-label="Afficher les données"
                  >
                    <Database size={16} />
                  </button>
                </>
              )}
              <button
                onClick={toggleMinimize}
                className="text-blue-200 hover:text-white transition-colors"
                aria-label={isMinimized ? "Agrandir" : "Réduire"}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                onClick={toggleChat}
                className="text-blue-200 hover:text-white transition-colors"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Zone principale - Messages, Conversations, Suggestions ou Données */}
              <div className="flex-1 overflow-hidden">
                {showConversations ? (
                  <ConversationList
                    chatbotService={chatbotService}
                    onConversationSelect={handleConversationSelect}
                    onNewConversation={handleNewConversation}
                    activeConversationId={activeConversationId}
                    className="h-full"
                  />
                ) : showSuggestions && messages.length <= 1 ? (
                  <div className="h-full overflow-y-auto p-4">
                    <QuickSuggestions 
                      onSuggestionClick={handleSuggestionClick}
                      disabled={isLoading}
                    />
                  </div>
                ) : showDataInsights && messages.length <= 1 ? (
                  <div className="h-full overflow-y-auto p-4">
                    <DataInsights 
                      onInsightClick={handleInsightClick}
                    />
                  </div>
                ) : (
                  <>
                    {/* Messages */}
                    <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => (
                        <ChatMessageComponent
                          key={message.id}
                          message={message}
                        />
                      ))}
                      
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 text-gray-800 rounded-lg p-3 max-w-[80%] border border-gray-200">
                            <div className="flex items-center space-x-2">
                              <Bot size={16} className="text-blue-600" />
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                              <span className="text-sm text-gray-600 ml-2">Assistant réfléchit...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Actions rapides en bas */}
                    {!showSuggestions && !showDataInsights && !showConversations && (
                      <div className="border-t border-gray-200 p-2">
                        <div className="flex space-x-1">
                          <button
                            onClick={toggleConversations}
                            className="flex-1 text-xs text-purple-600 hover:text-purple-800 transition-colors py-1"
                          >
                            💬 Conversations
                          </button>
                          <button
                            onClick={toggleSuggestions}
                            className="flex-1 text-xs text-blue-600 hover:text-blue-800 transition-colors py-1"
                          >
                            💡 Suggestions
                          </button>
                          <button
                            onClick={toggleDataInsights}
                            className="flex-1 text-xs text-green-600 hover:text-green-800 transition-colors py-1"
                          >
                            📊 Données
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tapez votre message..."
                    disabled={isLoading}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Envoyer le message"
                  >
                    <Send size={16} />
                  </button>
                </div>
                
                {/* Actions rapides */}
                <div className="mt-2 flex justify-between items-center">
                  <button
                    onClick={clearChat}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Effacer l'historique
                  </button>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Bot size={12} />
                    <span>Powered by Gemini AI</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
