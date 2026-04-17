import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  
  // Actions
  fetchConversations: (userId: string) => Promise<void>;
  setActiveConversation: (conversationId: string | null) => Promise<void>;
  createConversation: (userId: string, title: string) => Promise<Conversation | null>;
  addMessage: (conversationId: string, role: 'user' | 'assistant', content: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  loading: false,

  fetchConversations: async (userId: string) => {
    set({ loading: true });
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    set({ conversations: data || [], loading: false });
  },

  setActiveConversation: async (conversationId: string | null) => {
    if (!conversationId) {
      set({ activeConversation: null, messages: [] });
      return;
    }

    const conv = get().conversations.find(c => c.id === conversationId);
    if (conv) {
      set({ activeConversation: conv, loading: true });
      
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      set({ messages: messages || [], loading: false });
    }
  },

  createConversation: async (userId: string, title: string) => {
    const { data, error } = await supabase
      .from('conversations')
      .insert([{ user_id: userId, title }])
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    set(state => ({
      conversations: [data, ...state.conversations],
      activeConversation: data,
      messages: []
    }));

    return data;
  },

  addMessage: async (conversationId: string, role: 'user' | 'assistant', content: string) => {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ conversation_id: conversationId, role, content }])
      .select()
      .single();

    if (error) {
       console.error('Error adding message:', error);
       return;
    }

    set(state => ({
      messages: [...state.messages, data],
    }));

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  }
}));
