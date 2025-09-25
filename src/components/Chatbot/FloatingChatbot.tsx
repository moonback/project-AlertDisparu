import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Minimize2, Maximize2, MessageSquare, Trash2, Volume2, VolumeX } from 'lucide-react';
import { ChatbotService, ChatMessage } from '../../services/chatbotService';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';
import { ChatMessage as ChatMessageComponent } from './ChatMessage';
import { ConversationList } from './ConversationList';
import { SmartSuggestions } from './SmartSuggestions';

interface FloatingChatbotProps {
  className?: string;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [chatbotService] = useState(() => new ChatbotService());
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, loading: authLoading } = useAuth();

  // Initialiser le service avec l'utilisateur
  useEffect(() => {
    console.log('🔄 Mise à jour du contexte utilisateur:', user);
    if (user) {
      chatbotService.updateUserContext(user);
      console.log('✅ Utilisateur configuré dans le chatbot:', user.id);
      
       // Synchroniser la conversation active avec le service
       if (activeConversationId) {
         console.log('🔄 Synchronisation conversation active avec le service:', activeConversationId);
         chatbotService.setCurrentConversationId(activeConversationId);
       }
    } else {
      // Réinitialiser le service si l'utilisateur se déconnecte
      chatbotService.updateUserContext(null);
      setMessages([]);
      setActiveConversationId(undefined);
      setIsFirstMessage(true);
      console.log('❌ Utilisateur déconnecté du chatbot');
    }
  }, [user, chatbotService, activeConversationId]);

  // Auto-scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fonction pour nettoyer le texte pour TTS
  const cleanTextForTts = (text: string): string => {
    return text
      // Retirer les marqueurs Markdown
      .replace(/#{1,6}\s*/g, '') // Titres (# ## ### etc.)
      .replace(/\*\*(.*?)\*\*/g, '$1') // Gras (**texte**)
      .replace(/\*(.*?)\*/g, '$1') // Italique (*texte*)
      .replace(/`(.*?)`/g, '$1') // Code inline (`code`)
      .replace(/```[\s\S]*?```/g, '') // Blocs de code
      .replace(/~~(.*?)~~/g, '$1') // Barré (~~texte~~)
      
      // Retirer les caractères spéciaux
      .replace(/[#*`~_[\](){}]/g, '') // Caractères Markdown
      .replace(/[|\\]/g, '') // Pipes et backslashes
      .replace(/\s+/g, ' ') // Espaces multiples
      
      // Nettoyer les listes
      .replace(/^\s*[-*+]\s+/gm, '') // Puces de liste
      .replace(/^\s*\d+\.\s+/gm, '') // Numérotation
      
      // Remplacer les emojis par du texte
      .replace(/👋/g, 'bonjour')
      .replace(/🤖/g, 'robot')
      .replace(/📊/g, 'statistiques')
      .replace(/🔍/g, 'recherche')
      .replace(/✅/g, 'valide')
      .replace(/❌/g, 'erreur')
      .replace(/⚠️/g, 'attention')
      .replace(/💡/g, 'idée')
      .replace(/🎯/g, 'objectif')
      .replace(/🚀/g, 'lancement')
      .replace(/⭐/g, 'étoile')
      .replace(/🔥/g, 'chaud')
      .replace(/💪/g, 'fort')
      .replace(/🎉/g, 'fête')
      .replace(/🙏/g, 'merci')
      .replace(/👍/g, 'bien')
      .replace(/👎/g, 'mal')
      .replace(/❤️/g, 'coeur')
      .replace(/😊/g, 'sourire')
      .replace(/😢/g, 'triste')
      .replace(/😮/g, 'surpris')
      .replace(/😡/g, 'en colère')
      
      // Nettoyer les espaces et retours à la ligne
      .replace(/\n\s*\n/g, '. ') // Paragraphes
      .replace(/\n/g, ' ') // Retours à la ligne
      .replace(/\s+/g, ' ') // Espaces multiples
      .trim();
  };

  // Fonction pour lire un texte avec TTS
  const speakText = (text: string) => {
    if (!ttsEnabled) return;
    
    // Nettoyer le texte
    const cleanText = cleanTextForTts(text);
    
    // Vérifier que le texte n'est pas vide après nettoyage
    if (!cleanText || cleanText.length < 3) return;
    
    // Arrêter toute lecture en cours
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Configuration améliorée de la voix
    utterance.lang = 'fr-FR';
    utterance.rate = 0.85; // Vitesse plus lente pour une meilleure compréhension
    utterance.pitch = 1.1; // Légèrement plus aigu pour une voix plus claire
    utterance.volume = 0.9; // Volume plus élevé

    // Sélectionner la meilleure voix française disponible
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    
    // Priorité 1: Voix Google française spécifique
    selectedVoice = voices.find(voice => 
      voice.lang === 'fr-FR' && voice.name.includes('Google')
    );
    
    // Priorité 2: Toute voix Google française
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => 
        voice.lang.startsWith('fr') && voice.name.includes('Google')
      );
    }
    
    // Priorité 3: Voix française haute qualité (Microsoft, Natural, etc.)
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => 
        voice.lang === 'fr-FR' && 
        (voice.name.includes('Microsoft') || voice.name.includes('Natural') || voice.name.includes('Enhanced'))
      );
    }
    
    // Priorité 4: Toute voix française de qualité
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => 
        voice.lang.startsWith('fr') && 
        (voice.name.includes('Microsoft') || voice.name.includes('Natural') || voice.name.includes('Enhanced'))
      );
    }
    
    // Priorité 5: Toute voix française
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang.startsWith('fr'));
    }
    
    // Priorité 6: Voix par défaut du système
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.default);
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('🎤 Voix sélectionnée:', selectedVoice.name, selectedVoice.lang);
    } else {
      console.warn('🎤 Aucune voix française trouvée, utilisation de la voix par défaut');
    }

    // Événements pour le debugging
    utterance.onstart = () => {
      console.log('🎤 Début de la lecture TTS');
    };
    
    utterance.onend = () => {
      console.log('🎤 Fin de la lecture TTS');
    };
    
    utterance.onerror = (event) => {
      console.error('🎤 Erreur TTS:', event.error);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Fonction pour arrêter la lecture TTS
  const stopSpeaking = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  };

  // Basculer l'état TTS
  const toggleTts = () => {
    setTtsEnabled(!ttsEnabled);
    if (ttsEnabled) {
      stopSpeaking();
    }
  };

  // Focus sur l'input quand la chatbox s'ouvre
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !user) return;
    
    // Masquer les suggestions intelligentes après le premier message
    setShowSmartSuggestions(false);

    const userMessage = inputValue.trim();
    
    
     setInputValue('');
     setShowConversations(false);
    setIsLoading(true);

    try {
      
      // S'assurer que le service utilise la conversation active de l'interface
      if (activeConversationId) {
        console.log('🔄 Forcer la conversation active dans le service:', activeConversationId);
        chatbotService.setCurrentConversationId(activeConversationId);
      }
      
       const response = await chatbotService.processMessage(userMessage);
       setMessages(prev => {
         const newMessages = [...prev, response];
         
         // Lire la réponse avec TTS si activé
         if (ttsEnabled && response.role === 'assistant') {
           setTimeout(() => {
             speakText(response.content);
           }, 500); // Petit délai pour que l'interface se mette à jour
         }
         
         return newMessages;
       });
      
      // Récupérer l'ID de conversation depuis le service
      const currentConvId = response.conversationId || activeConversationId;
      if (currentConvId && !activeConversationId) {
        setActiveConversationId(currentConvId);
      }
      
      // Si c'est le premier message, générer un titre pour la conversation
      if (isFirstMessage && currentConvId) {
        setIsFirstMessage(false);
        // Attendre un peu avant de générer le titre pour que le message soit sauvegardé
        setTimeout(async () => {
          try {
            // Créer un titre simple sans API pour éviter les erreurs de quota
            const simpleTitle = userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : '');
            await chatbotService.updateConversationTitle(currentConvId, simpleTitle);
          } catch (error) {
            console.error('Erreur lors de la génération du titre:', error);
          }
        }, 1000);
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



  const handleNewConversation = async () => {
     try {
       setMessages([]);
       setActiveConversationId(undefined);
       setIsFirstMessage(true);
       setShowConversations(false);
       setShowSmartSuggestions(true);
      
      // Créer une nouvelle conversation
      const newConversationId = await chatbotService.createConversation();
      setActiveConversationId(newConversationId);
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
    }
  };

  const handleConversationSelect = async (conversationId: string) => {
    try {
      console.log('🔄 Chargement de la conversation:', conversationId);
      setActiveConversationId(conversationId);
      setShowConversations(false);
      
      // Charger les messages de la conversation
      const conversationMessages = await chatbotService.loadConversation(conversationId);
      console.log('📨 Messages chargés:', conversationMessages.length, conversationMessages);
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
    setShowSmartSuggestions(true);
    setActiveConversationId(undefined);
  };

  const handleDeleteAllConversations = async () => {
    if (!user) return;
    
    // Confirmation avant suppression
    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer TOUTES vos conversations ? Cette action est irréversible.'
    );
    
    if (!confirmed) return;

    try {
      await chatbotService.deleteAllConversations();
      
      // Réinitialiser l'interface
       setMessages([]);
       setActiveConversationId(undefined);
       setIsFirstMessage(true);
       setShowConversations(false);
       setShowSmartSuggestions(true);
      
      console.log('✅ Toutes les conversations ont été supprimées');
    } catch (error) {
      console.error('Erreur lors de la suppression des conversations:', error);
      alert('Erreur lors de la suppression des conversations. Veuillez réessayer.');
    }
  };



  const toggleConversations = () => {
    setShowConversations(!showConversations);
    setShowSmartSuggestions(false);
  };

  const toggleSmartSuggestions = () => {
    setShowSmartSuggestions(!showSmartSuggestions);
    setShowConversations(false);
  };

   // Message d'accueil
   useEffect(() => {
     if (isOpen && messages.length === 0) {
       console.log('👋 Affichage du message d\'accueil');
       const welcomeMessage: ChatMessage = {
         id: 'welcome',
         role: 'assistant',
         content: `Bonjour${user ? ` ${user.firstName}` : ''} ! 👋

 Que puis-je faire pour vous aider aujourd'hui ?`,
         timestamp: new Date()
       };
       setMessages([welcomeMessage]);
     }
   }, [isOpen, user, messages.length]);

   // Arrêter la lecture TTS quand le chatbot se ferme
   useEffect(() => {
     if (!isOpen) {
       stopSpeaking();
     }
   }, [isOpen]);

   // Charger les voix disponibles au démarrage
   useEffect(() => {
     const loadVoices = () => {
       const voices = window.speechSynthesis.getVoices();
       console.log('🎤 Toutes les voix disponibles:', voices.map(v => `${v.name} (${v.lang})`));
       
       // Identifier spécifiquement les voix françaises
       const frenchVoices = voices.filter(v => v.lang.startsWith('fr'));
       console.log('🎤 Voix françaises trouvées:', frenchVoices.map(v => `${v.name} (${v.lang})`));
       
       // Identifier les voix Google françaises
       const googleFrenchVoices = voices.filter(v => 
         v.lang.startsWith('fr') && v.name.includes('Google')
       );
       console.log('🎤 Voix Google françaises:', googleFrenchVoices.map(v => `${v.name} (${v.lang})`));
       
       if (googleFrenchVoices.length > 0) {
         console.log('✅ Voix Google française disponible:', googleFrenchVoices[0].name);
       } else {
         console.warn('⚠️ Aucune voix Google française trouvée');
       }
     };

     // Charger immédiatement si disponible
     loadVoices();

     // Recharger quand les voix sont disponibles (nécessaire sur certains navigateurs)
     if (window.speechSynthesis.onvoiceschanged !== undefined) {
       window.speechSynthesis.onvoiceschanged = loadVoices;
     }
   }, []);

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
                {user ? '✅' : '❌'}
              </span>
            </div>
             <div className="flex items-center space-x-2">
               {!isMinimized && (
                 <>
                   <button
                     onClick={toggleTts}
                     className={cn(
                       "text-blue-200 hover:text-white transition-colors",
                       ttsEnabled && "text-white"
                     )}
                     aria-label={ttsEnabled ? "Désactiver la lecture vocale" : "Activer la lecture vocale"}
                   >
                     {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                   </button>
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
                  <div className="h-full flex flex-col">
                    <ConversationList
                      chatbotService={chatbotService}
                      onConversationSelect={handleConversationSelect}
                      onNewConversation={handleNewConversation}
                      activeConversationId={activeConversationId}
                      className="flex-1"
                    />
                    {/* Bouton pour effacer toutes les conversations */}
                    <div className="border-t border-gray-200 p-3 bg-red-50">
                      <button
                        onClick={handleDeleteAllConversations}
                        className="w-full flex items-center justify-center space-x-2 text-red-600 hover:text-red-800 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Trash2 size={16} />
                        <span>Effacer toutes les conversations</span>
                      </button>
                    </div>
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
                      
                      {/* Suggestions intelligentes (affichées au début) */}
                      {showSmartSuggestions && messages.length <= 1 && user && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-3">
                          <SmartSuggestions 
                            onSuggestionClick={(suggestion) => {
                              setInputValue(suggestion);
                              setShowSmartSuggestions(false);
                            }}
                            userRole={user.role}
                          />
                        </div>
                      )}
                      
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
                     {!showConversations && (
                      <div className="border-t border-gray-200 p-2">
                        <div className="flex space-x-1">
                          <button
                            onClick={toggleConversations}
                            className="flex-1 text-xs text-purple-600 hover:text-purple-800 transition-colors py-1"
                          >
                            💬 Conversations
                          </button>
                          <button
                            onClick={toggleSmartSuggestions}
                            className="flex-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors py-1"
                          >
                            🧠 IA
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
                   <div className="flex items-center space-x-3">
                     <button
                       onClick={clearChat}
                       className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                     >
                       Nouvelle conversation
                     </button>
                     {ttsEnabled && (
                       <button
                         onClick={stopSpeaking}
                         className="text-xs text-red-500 hover:text-red-700 transition-colors"
                       >
                         Arrêter la lecture
                       </button>
                     )}
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
