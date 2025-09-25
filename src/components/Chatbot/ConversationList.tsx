import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Trash2, Edit2, Check, X, MoreVertical } from 'lucide-react';
import { ChatbotService, ChatConversation } from '../../services/chatbotService';
import { cn } from '../../utils/cn';

interface ConversationListProps {
  chatbotService: ChatbotService;
  onConversationSelect: (conversationId: string) => void;
  onNewConversation: () => void;
  activeConversationId?: string;
  className?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  chatbotService,
  onConversationSelect,
  onNewConversation,
  activeConversationId,
  className
}) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 ConversationList - useEffect déclenché');
    console.log('👤 Utilisateur dans le contexte:', chatbotService.context.user);
    
    // Vérifier que l'utilisateur est connecté avant de charger les conversations
    if (chatbotService.context.user) {
      console.log('✅ Utilisateur trouvé, chargement des conversations...');
      loadConversations();
    } else {
      console.log('❌ Pas d\'utilisateur, pas de chargement');
    }
  }, [chatbotService.context.user]);

  const loadConversations = async () => {
    console.log('🔄 ConversationList - loadConversations appelée');
    console.log('👤 Utilisateur dans le service:', chatbotService.context.user);
    
    if (!chatbotService.context.user) {
      console.log('⚠️ Pas d\'utilisateur, arrêt du chargement');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('📞 Appel à getUserConversations...');
      const convs = await chatbotService.getUserConversations();
      console.log('📋 Conversations récupérées:', convs);
      setConversations(convs);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = (conversation: ChatConversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleEditSave = async () => {
    if (!editingId) return;

    try {
      await chatbotService.updateConversationTitle(editingId, editTitle);
      await loadConversations();
      setEditingId(null);
      setEditTitle('');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du titre:', error);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleDelete = async (conversationId: string) => {
    try {
      await chatbotService.deleteConversation(conversationId);
      await loadConversations();
      setShowDeleteConfirm(null);
      
      // Si c'était la conversation active, créer une nouvelle
      if (activeConversationId === conversationId) {
        onNewConversation();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Hier';
    } else if (days < 7) {
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className={cn("p-4", className)}>
        <div className="space-y-3">
          <div className="flex items-center space-x-2 mb-4">
            <MessageSquare size={20} className="text-blue-600" />
            <span className="font-semibold text-gray-800">Conversations</span>
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-4", className)}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MessageSquare size={20} className="text-blue-600" />
            <span className="font-semibold text-gray-800">Conversations</span>
          </div>
          <button
            onClick={onNewConversation}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Nouvelle conversation"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Liste des conversations */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune conversation</p>
              <p className="text-xs">Commencez une nouvelle conversation</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "group relative p-3 rounded-lg border cursor-pointer transition-all",
                  activeConversationId === conversation.id
                    ? "bg-blue-50 border-blue-200 shadow-sm"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                )}
                onClick={() => onConversationSelect(conversation.id)}
              >
                {/* Contenu principal */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {editingId === conversation.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleEditSave();
                            if (e.key === 'Escape') handleEditCancel();
                          }}
                          autoFocus
                        />
                        <button
                          onClick={handleEditSave}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="p-1 text-gray-500 hover:bg-gray-50 rounded"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {conversation.title}
                        </h4>
                        {conversation.lastMessageContent && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {truncateText(conversation.lastMessageContent, 60)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {editingId !== conversation.id && (
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStart(conversation);
                        }}
                        className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                        title="Modifier le titre"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(conversation.id);
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Métadonnées */}
                {editingId !== conversation.id && (
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>
                      {conversation.messageCount} message{conversation.messageCount !== 1 ? 's' : ''}
                    </span>
                    <span>{formatDate(conversation.lastMessageAt)}</span>
                  </div>
                )}

                {/* Confirmation de suppression */}
                {showDeleteConfirm === conversation.id && (
                  <div className="absolute inset-0 bg-white bg-opacity-95 rounded-lg flex items-center justify-center space-x-2 p-3">
                    <span className="text-xs text-gray-700">Supprimer ?</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(conversation.id);
                      }}
                      className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Oui
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(null);
                      }}
                      className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Non
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Statistiques */}
        {conversations.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} au total
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
