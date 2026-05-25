import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { getUser, createProfile, UserData } from "@/lib/database";

interface AuthState {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string, role: "client" | "provider") => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserData: (data: Partial<UserData>) => void;
  clearError: () => void;
  initAuthListener: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initAuthListener: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        getUser(session.user.id).then(u => set({ user: u, isAuthenticated: !!u, isLoading: false }));
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        getUser(session.user.id).then(u => set({ user: u, isAuthenticated: !!u, isLoading: false }));
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    });

    return () => subscription.unsubscribe();
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const u = await getUser(data.user.id);
      set({ user: u, isAuthenticated: !!u, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  signup: async (name, email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (data.user) {
        const userData: UserData = { uid: data.user.id, name, email, role };
        // Salva perfil do usuário no Supabase
        await createProfile(userData);
        set({ user: userData, isAuthenticated: true, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },

  resetPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await supabase.auth.resetPasswordForEmail(email);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  updateUserData: (data) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...data } });
    }
  },
}));
