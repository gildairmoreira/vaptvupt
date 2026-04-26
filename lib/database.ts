import { supabase } from './supabase';

export interface ProviderData {
  uid: string;
  name: string;
  categories: string[];
  location: { latitude: number; longitude: number } | null;
  basePrice: number;
  available: boolean;
  rating: number;
  reviewCount: number;
  photoUrl?: string;
  verified: boolean;
  bio?: string;
}

export interface ServiceRequest {
  id?: string;
  clientId: string;
  providerId: string;
  serviceType: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'canceled';
  location: { latitude: number; longitude: number };
  description: string;
  isUrgent: boolean;
  estimatedPrice: number | null;
  createdAt?: Date;
}

export const subscribeAvailableProviders = (callback: (providers: ProviderData[]) => void) => {
  // Mock para desenvolvimento sem banco ligado
  const mockProviders: ProviderData[] = [
    { uid: 'p1', name: 'João Silva', categories: ['plumbing'], location: { latitude: -23.5505, longitude: -46.6333 }, basePrice: 100, available: true, rating: 4.8, reviewCount: 20, verified: true },
    { uid: 'p2', name: 'Maria Eletricista', categories: ['electrical'], location: { latitude: -23.5555, longitude: -46.6383 }, basePrice: 150, available: true, rating: 4.9, reviewCount: 35, verified: true },
  ];
  callback(mockProviders);
  return () => {};
};

export const getProvider = async (id: string): Promise<ProviderData | null> => {
  return { uid: id, name: 'Prestador Teste', categories: ['plumbing'], location: { latitude: -23.5505, longitude: -46.6333 }, basePrice: 100, available: true, rating: 4.8, reviewCount: 20, verified: true };
};

export const getProviderReviews = async (id: string) => {
  return [];
};

export const searchProviders = async (query: string): Promise<ProviderData[]> => {
  return [
    { uid: 'p1', name: 'João Silva', categories: ['plumbing'], location: { latitude: -23.5505, longitude: -46.6333 }, basePrice: 100, available: true, rating: 4.8, reviewCount: 20, verified: true },
  ];
};

export const createServiceRequest = async (data: ServiceRequest): Promise<string> => {
  return 'mock-request-id';
};

export const updateRequestStatus = async (requestId: string, status: string): Promise<void> => {
  return;
};

export const subscribeRequest = (requestId: string, callback: (req: ServiceRequest) => void) => {
  return () => {};
};

export const getUser = async (uid: string) => {
  return { uid, name: 'Usuário Teste', role: 'client' };
};

export interface ChatMessage {
  id?: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  read: boolean;
  createdAt?: Date;
}

export const getOrCreateChat = async (reqId: string, clientId: string, provId: string) => {
  return 'chat-mock-id';
};

export const sendMessage = async (chatId: string, msg: ChatMessage) => {
  return;
};

export const subscribeMessages = (chatId: string, callback: (msgs: ChatMessage[]) => void) => {
  callback([]);
  return () => {};
};

export const markMessagesRead = async (chatId: string, uid: string) => {
  return;
};
