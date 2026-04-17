import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  plan_type?: 'free' | 'basic' | 'pro';
  requests_remaining?: number;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch additional user profile data from public.profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, email, plan_type, requests_remaining')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          set({ 
            user: {
              id: session.user.id,
              email: session.user.email || profile.email,
              plan_type: profile.plan_type as 'free' | 'basic' | 'pro',
              requests_remaining: profile.requests_remaining
            }, 
            loading: false, 
            initialized: true 
          });
        } else {
          // Fallback to base user data if profile isn't ready yet
          set({ 
            user: { 
              id: session.user.id, 
              email: session.user.email || '',
              plan_type: 'free' as 'free'
            }, 
            loading: false, 
            initialized: true 
          });
        }
      } else {
        set({ user: null, loading: false, initialized: true });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('plan_type, requests_remaining')
            .eq('id', session.user.id)
            .single();
          
          set({ 
            user: {
              id: session.user.id,
              email: session.user.email || '',
              plan_type: (profile?.plan_type as 'free' | 'basic' | 'pro') || 'free',
              requests_remaining: profile?.requests_remaining
            }
          });
        }
 else if (event === 'SIGNED_OUT') {
          set({ user: null });
        }
      });

    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ loading: false, initialized: true });
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
