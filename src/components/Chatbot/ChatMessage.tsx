import React from 'react';
import { Bot, User, Clock, Copy, Check } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../services/chatbotService';

interface ChatMessageProps {
  message: ChatMessageType;
  onCopy?: (content: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onCopy }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      onCopy?.(message.content);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const formatContent = (content: string) => {
    // Formatage simple pour améliorer la lisibilité
    return content
      .split('\n')
      .map((line, index) => {
        // Détecter les listes à puces
        if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
          return (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>{line.trim().substring(2)}</span>
            </div>
          );
        }
        
        // Détecter les titres (texte en gras)
        if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
          return (
            <div key={index} className="font-semibold text-gray-900 mt-2 mb-1">
              {line.trim().slice(2, -2)}
            </div>
          );
        }
        
        // Détecter les emojis et les mettre en évidence
        if (line.includes('🔍') || line.includes('📊') || line.includes('🎯') || line.includes('🤖')) {
          return (
            <div key={index} className="flex items-center space-x-2">
              <span>{line}</span>
            </div>
          );
        }
        
        // Ligne normale
        return <div key={index}>{line}</div>;
      });
  };

  return (
    <div
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-lg p-3 text-sm relative group ${
          message.role === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-800 border border-gray-200'
        }`}
      >
        {/* En-tête du message */}
        <div className="flex items-center space-x-2 mb-2">
          {message.role === 'assistant' && (
            <Bot size={16} className="text-blue-600 flex-shrink-0" />
          )}
          {message.role === 'user' && (
            <User size={16} className="text-blue-200 flex-shrink-0" />
          )}
          <span className="font-medium text-xs opacity-75">
            {message.role === 'user' ? 'Vous' : 'Assistant IA'}
          </span>
        </div>

        {/* Contenu du message */}
        <div className="whitespace-pre-wrap leading-relaxed">
          {formatContent(message.content)}
        </div>

        {/* Pied du message */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 border-opacity-50">
          <div className="flex items-center space-x-1 text-xs opacity-75">
            <Clock size={12} />
            <span>
              {message.timestamp.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          {/* Bouton de copie pour les messages de l'assistant */}
          {message.role === 'assistant' && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
              title="Copier le message"
            >
              {copied ? (
                <Check size={12} className="text-green-600" />
              ) : (
                <Copy size={12} className="text-gray-500" />
              )}
            </button>
          )}
        </div>

        {/* Données supplémentaires si disponibles */}
        {message.data && (
          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
            <div className="text-xs text-blue-800">
              Données: {JSON.stringify(message.data, null, 2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
