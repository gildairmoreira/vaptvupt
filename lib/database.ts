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

export interface UserData {
  uid: string;
  name: string;
  email: string;
  role: 'client' | 'provider';
  phone?: string;
  photoUrl?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  authorName?: string;
  createdAt?: Date;
}

export interface ServiceRequest {
  id?: string;
  clientId: string;
  providerId: string;
  serviceType: string;
  status: 'pending' | 'accepted' | 'on_the_way' | 'completed' | 'canceled';
  location: { latitude: number; longitude: number };
  description: string;
  isUrgent: boolean;
  estimatedPrice: number | null;
  clientMessage?: string;
  createdAt?: Date;
}

export interface ChatMessage {
  id?: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  read: boolean;
  createdAt?: Date;
}

// ========================
// FUNÇÕES DE PRESTADOR
// ========================

export const createService = async (data: any) => {
  console.log("Mock service created", data);
  return { id: `service_${Date.now()}` };
};

export const subscribeAvailableProviders = (callback: (providers: ProviderData[]) => void) => {
  const bhProviders: ProviderData[] = [
    { uid: 'p1', name: 'João Silva', categories: ['plumbing'], location: { latitude: -19.9329, longitude: -43.9378 }, basePrice: 100, available: true, rating: 4.8, reviewCount: 20, verified: true, bio: "Encanador certificado com 10 anos de experiência. Atendo toda BH." },
    { uid: 'p2', name: 'Maria Eletricista', categories: ['electrical'], location: { latitude: -19.9212, longitude: -43.9445 }, basePrice: 150, available: true, rating: 4.9, reviewCount: 35, verified: true, bio: "Especialista em instalações residenciais na Savassi e Lourdes." },
    { uid: 'p3', name: 'Carlos Montador', categories: ['assembly'], location: { latitude: -19.9455, longitude: -43.9283 }, basePrice: 80, available: true, rating: 4.7, reviewCount: 15, verified: false, bio: "Montagem de móveis no Buritis e Belvedere." },
    { uid: 'p4', name: 'Ana Faxinas', categories: ['cleaning'], location: { latitude: -19.9105, longitude: -43.9533 }, basePrice: 120, available: true, rating: 5.0, reviewCount: 50, verified: true, bio: "Limpeza pesada em apartamentos no Centro e Barro Preto." },
    { uid: 'p5', name: 'Pedro Pinturas', categories: ['painting'], location: { latitude: -19.8655, longitude: -43.9712 }, basePrice: 200, available: true, rating: 4.6, reviewCount: 12, verified: true, bio: "Pintura residencial e comercial na região da Pampulha." },
    { uid: 'p6', name: 'Marcos Ar-condicionado', categories: ['aircon'], location: { latitude: -19.9555, longitude: -43.9112 }, basePrice: 180, available: true, rating: 4.9, reviewCount: 28, verified: true, bio: "Instalação e manutenção no Sion e Mangabeiras." },
    { uid: 'p7', name: 'Lucia Jardineira', categories: ['gardening'], location: { latitude: -19.9012, longitude: -43.9145 }, basePrice: 90, available: true, rating: 4.8, reviewCount: 22, verified: false, bio: "Cuidado de jardins no Santa Efigênia e Floresta." },
  ];
  callback(bhProviders);
  return () => {};
};

export const getProvider = async (id: string): Promise<ProviderData | null> => {
  const providers: Record<string, ProviderData> = {
    'p1': { uid: 'p1', name: 'João Silva', categories: ['plumbing'], location: { latitude: -23.5505, longitude: -46.6333 }, basePrice: 100, available: true, rating: 4.8, reviewCount: 20, verified: true, bio: "Encanador certificado com 10 anos de experiência." },
    'p2': { uid: 'p2', name: 'Maria Eletricista', categories: ['electrical'], location: { latitude: -23.5555, longitude: -46.6383 }, basePrice: 150, available: true, rating: 4.9, reviewCount: 35, verified: true, bio: "Especialista em instalações residenciais e comerciais." },
  };
  return providers[id] || { uid: id, name: 'Prestador Teste', categories: ['plumbing'], location: { latitude: -23.5505, longitude: -46.6333 }, basePrice: 100, available: true, rating: 4.8, reviewCount: 20, verified: true };
};

export const getProviderData = getProvider;

export const updateProviderData = async (uid: string, data: Partial<ProviderData>) => {
  console.log("Updating provider", uid, data);
  return;
};

export const setProviderAvailability = async (uid: string, available: boolean) => {
  return;
};

// ========================
// FUNÇÕES DE SOLICITAÇÃO
// ========================

export const createServiceRequest = async (data: ServiceRequest): Promise<string> => {
  return new Promise((resolve) => setTimeout(() => resolve('mock-request-id-' + Date.now()), 1000));
};

export const updateRequestStatus = async (requestId: string, status: string, providerId?: string): Promise<void> => {
  return;
};

export const subscribeRequest = (requestId: string, callback: (req: ServiceRequest) => void) => {
  setTimeout(() => {
    callback({
      id: requestId,
      clientId: 'user-1',
      providerId: 'p1',
      serviceType: 'Encanamento',
      status: 'pending',
      location: { latitude: -23.55, longitude: -46.63 },
      description: 'Vazamento na pia',
      isUrgent: true,
      estimatedPrice: 120,
      createdAt: new Date()
    });
  }, 500);
  return () => {};
};

export const subscribePendingRequests = (callback: (reqs: ServiceRequest[]) => void) => {
  setTimeout(() => {
    callback([
      {
        id: 'mock-req-p1',
        clientId: 'user-client-1',
        providerId: '',
        serviceType: 'Encanamento',
        status: 'pending',
        location: { latitude: -23.55, longitude: -46.63 },
        description: 'Vazamento urgente no banheiro',
        isUrgent: true,
        estimatedPrice: 150,
        createdAt: new Date()
      }
    ]);
  }, 2000);
  return () => {};
};

export const subscribeProviderRequests = (providerId: string, callback: (reqs: ServiceRequest[]) => void) => {
  callback([]);
  return () => {};
};

export const getClientHistory = async (clientId: string): Promise<ServiceRequest[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([]);
    }, 800);
  });
};

// ========================
// FUNÇÕES DE USUÁRIO
// ========================

export const getUser = async (uid: string): Promise<UserData | null> => {
  return { uid, name: 'Usuário Teste', email: 'teste@teste.com', role: 'client' };
};

export const updateUser = async (uid: string, data: any) => {
  return;
};

// ========================
// AVALIAÇÕES E REVIEWS
// ========================

export const getProviderReviews = async (id: string): Promise<Review[]> => {
  return [
    { id: 'r1', rating: 5, comment: "Excelente serviço, muito rápido!", authorName: "Carlos", createdAt: new Date() },
    { id: 'r2', rating: 4, comment: "Chegou no horário e resolveu o problema.", authorName: "Maria", createdAt: new Date() }
  ];
};

export const saveReview = async (data: {
  requestId: string;
  clientId: string;
  providerId: string;
  rating: number;
  comment?: string;
}) => {
  return;
};

// ========================
// CHAT
// ========================

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
