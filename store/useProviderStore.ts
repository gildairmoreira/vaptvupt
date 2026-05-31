// Store do prestador — VaptVupt
// Gerencia disponibilidade, solicitações recebidas e métricas do dashboard

import { create } from "zustand";
import {
  setProviderAvailability,
  subscribePendingRequests,
  updateRequestStatus,
  ServiceRequest,
  getProvider,
  getProviderBalance,
} from "@/lib/database";

interface ProviderState {
  // Estado
  isAvailable: boolean;
  pendingRequests: ServiceRequest[];
  activeRequestId: string | null;
  todayEarnings: number;
  todayServices: number;
  avgRating: number;
  balance: number; // Saldo da carteira (já descontada a taxa da plataforma)
  isLoading: boolean;
  error: string | null;

  // Ações
  toggleAvailability: (uid: string) => Promise<void>;
  loadAvailability: (uid: string) => Promise<void>;
  loadBalance: (uid: string) => Promise<void>;
  acceptRequest: (requestId: string, providerId: string) => Promise<void>;
  declineRequest: (requestId: string) => Promise<void>;
  startListening: () => () => void;
  setMetrics: (earnings: number, services: number, rating: number) => void;
  clearError: () => void;
  addBalance: (amount: number) => void;
  incrementServices: () => void;
  clearActiveRequest: () => void;
}

export const useProviderStore = create<ProviderState>((set, get) => ({
  isAvailable: false,
  pendingRequests: [],
  activeRequestId: null,
  todayEarnings: 0,
  todayServices: 0,
  avgRating: 0,
  balance: 0,
  isLoading: false,
  error: null,

  // Carrega disponibilidade real do Supabase ao montar a tela
  loadAvailability: async (uid) => {
    try {
      const provider = await getProvider(uid);
      if (provider) {
        set({
          isAvailable: provider.available,
          avgRating: provider.rating,
          balance: provider.balance || 0,
        });
      }
    } catch {
      console.error("Erro ao carregar disponibilidade do Supabase");
    }
  },

  // Carrega saldo do banco de dados
  loadBalance: async (uid) => {
    try {
      const balance = await getProviderBalance(uid);
      set({ balance });
    } catch {
      console.error("Erro ao carregar saldo do Supabase");
    }
  },

  // Alterna disponibilidade e sincroniza com Supabase
  toggleAvailability: async (uid) => {
    const { isAvailable } = get();
    const newStatus = !isAvailable;
    set({ isAvailable: newStatus });
    try {
      await setProviderAvailability(uid, newStatus);
    } catch {
      // Reverte em caso de erro
      set({ isAvailable, error: "Não foi possível atualizar disponibilidade." });
    }
  },

  // Aceita uma solicitação de serviço
  acceptRequest: async (requestId, providerId) => {
    set({ isLoading: true, error: null });
    try {
      await updateRequestStatus(requestId, "accepted", providerId);
      set({ activeRequestId: requestId, isLoading: false });
    } catch {
      set({
        error: "Não foi possível aceitar a solicitação.",
        isLoading: false,
      });
    }
  },

  // Recusa uma solicitação de serviço
  declineRequest: async (requestId) => {
    set({ isLoading: true });
    try {
      await updateRequestStatus(requestId, "canceled");
      set({ isLoading: false });
    } catch {
      set({
        error: "Não foi possível recusar a solicitação.",
        isLoading: false,
      });
    }
  },

  // Inicia listener de solicitações pendentes próximas
  startListening: () => {
    const unsubscribe = subscribePendingRequests((requests) => {
      set({ pendingRequests: requests });
    });
    return unsubscribe;
  },

  // Atualiza métricas do dashboard
  setMetrics: (earnings, services, rating) => {
    set({
      todayEarnings: earnings,
      todayServices: services,
      avgRating: rating,
    });
  },

  clearError: () => set({ error: null }),

  addBalance: (amount) => {
    set((state) => ({ balance: state.balance + amount }));
  },

  incrementServices: () => {
    set((state) => ({ todayServices: state.todayServices + 1 }));
  },

  clearActiveRequest: () => set({ activeRequestId: null }),
}));
