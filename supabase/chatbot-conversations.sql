-- Tables pour le système de chatbot avec conversations multiples

-- Table des conversations
CREATE TABLE public.chatbot_conversations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL DEFAULT 'Nouvelle conversation',
    created_at timestamp with time ZONE DEFAULT now(),
    updated_at timestamp with time ZONE DEFAULT now(),
    is_active boolean DEFAULT true,
    last_message_at timestamp with time ZONE DEFAULT now()
);

-- Table des messages de conversation
CREATE TABLE public.chatbot_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id uuid NOT NULL REFERENCES public.chatbot_conversations(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('user', 'assistant')),
    content text NOT NULL,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time ZONE DEFAULT now(),
    message_order integer NOT NULL
);

-- Index pour les performances
CREATE INDEX idx_chatbot_conversations_user_id ON public.chatbot_conversations(user_id);
CREATE INDEX idx_chatbot_conversations_active ON public.chatbot_conversations(user_id, is_active);
CREATE INDEX idx_chatbot_conversations_updated ON public.chatbot_conversations(updated_at DESC);

CREATE INDEX idx_chatbot_messages_conversation_id ON public.chatbot_messages(conversation_id);
CREATE INDEX idx_chatbot_messages_order ON public.chatbot_messages(conversation_id, message_order);
CREATE INDEX idx_chatbot_messages_created_at ON public.chatbot_messages(created_at DESC);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_chatbot_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_message_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chatbot_conversations_updated_at 
    BEFORE UPDATE ON public.chatbot_conversations
    FOR EACH ROW EXECUTE FUNCTION update_chatbot_conversation_updated_at();

-- Trigger pour mettre à jour la conversation quand un message est ajouté
CREATE OR REPLACE FUNCTION update_conversation_on_new_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chatbot_conversations 
    SET last_message_at = NEW.created_at,
        updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_on_new_message_trigger
    AFTER INSERT ON public.chatbot_messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_on_new_message();

-- Politiques RLS
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_messages ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir et modifier leurs propres conversations
CREATE POLICY "Users can view their own conversations" ON public.chatbot_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" ON public.chatbot_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON public.chatbot_conversations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" ON public.chatbot_conversations
    FOR DELETE USING (auth.uid() = user_id);

-- Les utilisateurs peuvent voir et modifier leurs propres messages
CREATE POLICY "Users can view their own messages" ON public.chatbot_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chatbot_conversations 
            WHERE chatbot_conversations.id = chatbot_messages.conversation_id 
            AND chatbot_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in their conversations" ON public.chatbot_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chatbot_conversations 
            WHERE chatbot_conversations.id = chatbot_messages.conversation_id 
            AND chatbot_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own messages" ON public.chatbot_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.chatbot_conversations 
            WHERE chatbot_conversations.id = chatbot_messages.conversation_id 
            AND chatbot_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own messages" ON public.chatbot_messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.chatbot_conversations 
            WHERE chatbot_conversations.id = chatbot_messages.conversation_id 
            AND chatbot_conversations.user_id = auth.uid()
        )
    );

-- Les autorités peuvent voir toutes les conversations (optionnel)
CREATE POLICY "Authorities can view all conversations" ON public.chatbot_conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'authority'
        )
    );

CREATE POLICY "Authorities can view all messages" ON public.chatbot_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'authority'
        )
    );

-- Fonction pour obtenir les conversations d'un utilisateur avec le dernier message
CREATE OR REPLACE FUNCTION get_user_conversations_with_last_message(user_uuid uuid)
RETURNS TABLE (
    conversation_id uuid,
    title text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    last_message_at timestamp with time zone,
    is_active boolean,
    last_message_content text,
    last_message_role text,
    message_count bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as conversation_id,
        c.title,
        c.created_at,
        c.updated_at,
        c.last_message_at,
        c.is_active,
        COALESCE(last_msg.content, '') as last_message_content,
        COALESCE(last_msg.role, '') as last_message_role,
        msg_counts.message_count
    FROM public.chatbot_conversations c
    LEFT JOIN LATERAL (
        SELECT content, role
        FROM public.chatbot_messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.message_order DESC
        LIMIT 1
    ) last_msg ON true
    LEFT JOIN LATERAL (
        SELECT COUNT(*) as message_count
        FROM public.chatbot_messages m
        WHERE m.conversation_id = c.id
    ) msg_counts ON true
    WHERE c.user_id = user_uuid
    ORDER BY c.last_message_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les messages d'une conversation
CREATE OR REPLACE FUNCTION get_conversation_messages(conv_id uuid, user_uuid uuid)
RETURNS TABLE (
    message_id uuid,
    role text,
    content text,
    metadata jsonb,
    created_at timestamp with time zone,
    message_order integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id as message_id,
        m.role,
        m.content,
        m.metadata,
        m.created_at,
        m.message_order
    FROM public.chatbot_messages m
    JOIN public.chatbot_conversations c ON m.conversation_id = c.id
    WHERE m.conversation_id = conv_id 
    AND c.user_id = user_uuid
    ORDER BY m.message_order ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer une nouvelle conversation
CREATE OR REPLACE FUNCTION create_new_conversation(user_uuid uuid, conversation_title text DEFAULT 'Nouvelle conversation')
RETURNS uuid AS $$
DECLARE
    new_conversation_id uuid;
BEGIN
    INSERT INTO public.chatbot_conversations (user_id, title)
    VALUES (user_uuid, conversation_title)
    RETURNING id INTO new_conversation_id;
    
    RETURN new_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour ajouter un message à une conversation
CREATE OR REPLACE FUNCTION add_message_to_conversation(
    conv_id uuid,
    msg_role text,
    msg_content text,
    msg_metadata jsonb DEFAULT '{}',
    user_uuid uuid DEFAULT auth.uid()
)
RETURNS uuid AS $$
DECLARE
    new_message_id uuid;
    next_order integer;
BEGIN
    -- Vérifier que la conversation appartient à l'utilisateur
    IF NOT EXISTS (
        SELECT 1 FROM public.chatbot_conversations 
        WHERE id = conv_id AND user_id = user_uuid
    ) THEN
        RAISE EXCEPTION 'Conversation not found or access denied';
    END IF;
    
    -- Obtenir le prochain ordre de message
    SELECT COALESCE(MAX(message_order), 0) + 1 INTO next_order
    FROM public.chatbot_messages
    WHERE conversation_id = conv_id;
    
    -- Insérer le message
    INSERT INTO public.chatbot_messages (conversation_id, role, content, metadata, message_order)
    VALUES (conv_id, msg_role, msg_content, msg_metadata, next_order)
    RETURNING id INTO new_message_id;
    
    RETURN new_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
