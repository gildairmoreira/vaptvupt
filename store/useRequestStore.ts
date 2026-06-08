// Store de solicitações de serviço — VaptVupt
// Gerencia o estado da solicitação ativa do cliente

import { create } from "zustand";

import {
  createServiceRequest,
  updateRequestStatus,
  subscribeRequest,
  ServiceRequest,
} from "@/lib/database";
import { ProviderData } from "@/lib/database";

interface RequestState {
  // Estado
  activeRequest: ServiceRequest | null;
  activeRequestId: string | null;
  selectedProvider: ProviderData | null;
  serviceDescription: string;
  isUrgent: boolean;
  isLoading: boolean;
  error: string | null;

  // Ações
  setServiceDescription: (description: string, isUrgent: boolean) => void;
  selectProvider: (provider: ProviderData) => void;
  sendRequest: (clientId: string, location: { latitude: number, longitude: number }, message?: string) => Promise<string>;
  cancelRequest: (requestId: string) => Promise<void>;
  subscribeToRequest: (requestId: string) => () => void;
  clearRequest: () => void;
  clearError: () => void;
}

export const useRequestStore = create<RequestState>((set, get) => ({
  activeRequest: null,
  activeRequestId: null,
  selectedProvider: null,
  serviceDescription: "",
  isUrgent: false,
  isLoading: false,
  error: null,

  // Define a descrição do serviço e detecção de urgência
  setServiceDescription: (description, isUrgent) => {
    set({ serviceDescription: description, isUrgent });
  },

  // Seleciona o prestador para solicitar
  selectProvider: (provider) => {
    set({ selectedProvider: provider });
  },

  // Envia a solicitação para o Supabase
  sendRequest: async (clientId, location, message) => {
    const { selectedProvider, serviceDescription, isUrgent } = get();
    if (!selectedProvider) throw new Error("Nenhum prestador selecionado");

    set({ isLoading: true, error: null });
    try {
      const requestId = await createServiceRequest({
        clientId,
        providerId: selectedProvider.uid,
        serviceType: selectedProvider.categories[0] || "other",
        description: serviceDescription,
        isUrgent,
        location,
        status: "pending",
        estimatedPrice: selectedProvider.basePrice,
        clientMessage: message,
      });

      set({ activeRequestId: requestId, isLoading: false });
      return requestId;
    } catch {
      set({
        error: "Não foi possível enviar a solicitação. Tente novamente.",
        isLoading: false,
      });
      throw new Error("Falha ao criar solicitação");
    }
  },

  // Cancela a solicitação ativa
  cancelRequest: async (requestId) => {
    set({ isLoading: true });
    try {
      await updateRequestStatus(requestId, "canceled");
      set({ activeRequest: null, activeRequestId: null, isLoading: false });
    } catch {
      set({
        error: "Não foi possível cancelar. Tente novamente.",
        isLoading: false,
      });
    }
  },

  // Escuta atualizações em tempo real da solicitação ativa
  subscribeToRequest: (requestId) => {
    const unsubscribe = subscribeRequest(requestId, (request) => {
      set({ activeRequest: request });
    });
    return unsubscribe;
  },

  // Limpa estado após conclusão
  clearRequest: () => {
    set({
      activeRequest: null,
      activeRequestId: null,
      selectedProvider: null,
      serviceDescription: "",
      isUrgent: false,
    });
  },

  clearError: () => set({ error: null }),
}));
