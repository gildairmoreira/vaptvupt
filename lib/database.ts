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
// DADOS MOCK DE PRESTADORES (BH)
// ========================

const bhProviders: ProviderData[] = [
  { uid: 'p1', name: 'João Silva', categories: ['plumbing'], location: { latitude: -19.9329, longitude: -43.9378 }, basePrice: 100, available: true, rating: 4.8, reviewCount: 20, verified: true, bio: "Encanador certificado com 10 anos de experiência. Atendo toda BH." },
  { uid: 'p2', name: 'Maria Eletricista', categories: ['electrical'], location: { latitude: -19.9212, longitude: -43.9445 }, basePrice: 150, available: true, rating: 4.9, reviewCount: 35, verified: true, bio: "Especialista em instalações residenciais na Savassi e Lourdes." },
  { uid: 'p3', name: 'Carlos Montador', categories: ['assembly'], location: { latitude: -19.9455, longitude: -43.9283 }, basePrice: 80, available: true, rating: 4.7, reviewCount: 15, verified: false, bio: "Montagem de móveis no Buritis e Belvedere." },
  { uid: 'p4', name: 'Ana Faxinas', categories: ['cleaning'], location: { latitude: -19.9105, longitude: -43.9533 }, basePrice: 120, available: true, rating: 5.0, reviewCount: 50, verified: true, bio: "Limpeza pesada em apartamentos no Centro e Barro Preto." },
  { uid: 'p5', name: 'Pedro Pinturas', categories: ['painting'], location: { latitude: -19.8655, longitude: -43.9712 }, basePrice: 200, available: true, rating: 4.6, reviewCount: 12, verified: true, bio: "Pintura residencial e comercial na região da Pampulha." },
  { uid: 'p6', name: 'Marcos Ar-condicionado', categories: ['aircon'], location: { latitude: -19.9555, longitude: -43.9112 }, basePrice: 180, available: true, rating: 4.9, reviewCount: 28, verified: true, bio: "Instalação e manutenção no Sion e Mangabeiras." },
  { uid: 'p7', name: 'Lucia Jardineira', categories: ['gardening'], location: { latitude: -19.9012, longitude: -43.9145 }, basePrice: 90, available: true, rating: 4.8, reviewCount: 22, verified: false, bio: "Cuidado de jardins no Santa Efigênia e Floresta." },
];

// ========================
// FUNÇÕES DE PRESTADOR
// ========================

export const createService = async (data: any) => {
  console.log("Mock service created", data);
  return { id: `service_${Date.now()}` };
};

export const subscribeAvailableProviders = (callback: (providers: ProviderData[]) => void) => {
  callback(bhProviders);
  return () => {};
};

// Busca prestadores por texto (nome ou categoria)
export const searchProviders = async (query: string): Promise<ProviderData[]> => {
  const q = query.toLowerCase();
  // Mapeamento de termos em PT-BR para chaves de categoria
  const categoryMap: Record<string, string> = {
    'encanador': 'plumbing', 'encanamento': 'plumbing',
    'eletricista': 'electrical', 'elétrica': 'electrical', 'eletrica': 'electrical',
    'faxina': 'cleaning', 'limpeza': 'cleaning', 'faxineira': 'cleaning',
    'montagem': 'assembly', 'montador': 'assembly',
    'pintura': 'painting', 'pintor': 'painting',
    'jardinagem': 'gardening', 'jardineiro': 'gardening', 'jardineira': 'gardening',
    'ar-condicionado': 'aircon', 'ar condicionado': 'aircon',
  };

  return bhProviders.filter(p => {
    // Busca por nome
    if (p.name.toLowerCase().includes(q)) return true;
    // Busca por categoria traduzida
    const mappedCat = categoryMap[q];
    if (mappedCat && p.categories.includes(mappedCat)) return true;
    // Busca direta por chave de categoria
    if (p.categories.some(c => c.includes(q))) return true;
    return false;
  });
};

export const getProvider = async (id: string): Promise<ProviderData | null> => {
  const found = bhProviders.find(p => p.uid === id);
  if (found) return found;
  return { uid: id, name: 'Prestador Teste', categories: ['plumbing'], location: { latitude: -19.9329, longitude: -43.9378 }, basePrice: 100, available: true, rating: 4.8, reviewCount: 20, verified: true };
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
      location: { latitude: -19.9329, longitude: -43.9378 },
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
        location: { latitude: -19.9329, longitude: -43.9378 },
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
  // Tenta buscar no Supabase primeiro
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('uid', uid)
      .single();

    if (data && !error) {
      return {
        uid: data.uid,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        photoUrl: data.photoUrl,
      };
    }
  } catch {
    // Fallback para mock se Supabase não estiver disponível
  }

  // Mock fallback
  return { uid, name: 'Usuário Teste', email: 'teste@teste.com', role: 'client' };
};

export const createUserProfile = async (userData: UserData): Promise<void> => {
  // Salva perfil do user no Supabase após signup
  try {
    const { error } = await supabase
      .from('users')
      .insert({
        uid: userData.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      });

    if (error) {
      console.error('Erro ao salvar perfil no Supabase:', error.message);
    }
  } catch (err) {
    console.error('Erro de conexão ao salvar perfil:', err);
  }
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
// CHAT — Mock funcional com estado em memória
// ========================

// Armazena mensagens em memória para simular chat funcional
const chatStore: Record<string, ChatMessage[]> = {};
const chatListeners: Record<string, ((msgs: ChatMessage[]) => void)[]> = {};

// Mensagens iniciais de exemplo para qualquer chat novo
const initialMockMessages: Omit<ChatMessage, 'chatId'>[] = [
  {
    id: 'msg-1',
    senderId: 'p1',
    senderName: 'João Silva',
    text: 'Olá! Vi sua solicitação. Posso ajudar sim!',
    read: true,
    createdAt: new Date(Date.now() - 300000),
  },
  {
    id: 'msg-2',
    senderId: 'mock-client-1',
    senderName: 'Cliente Teste',
    text: 'Ótimo! Qual o valor para um reparo de torneira?',
    read: true,
    createdAt: new Date(Date.now() - 240000),
  },
  {
    id: 'msg-3',
    senderId: 'p1',
    senderName: 'João Silva',
    text: 'Para reparo de torneira fico em torno de R$ 80 a R$ 120, dependendo da peça. Posso ir aí ainda hoje!',
    read: true,
    createdAt: new Date(Date.now() - 180000),
  },
];

export const getOrCreateChat = async (reqId: string, clientId: string, provId: string) => {
  const chatId = `chat-${reqId}`;

  // Inicializa com mensagens mock se ainda não existir
  if (!chatStore[chatId]) {
    chatStore[chatId] = initialMockMessages.map(m => ({ ...m, chatId }));
  }

  return chatId;
};

export const sendMessage = async (chatId: string, msg: ChatMessage) => {
  // Cria mensagem com ID e timestamp
  const newMsg: ChatMessage = {
    ...msg,
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    chatId,
    createdAt: new Date(),
  };

  // Adiciona ao store
  if (!chatStore[chatId]) {
    chatStore[chatId] = [];
  }
  chatStore[chatId].push(newMsg);

  // Notifica todos os listeners deste chat
  const listeners = chatListeners[chatId] || [];
  listeners.forEach(cb => cb([...chatStore[chatId]]));
};

export const subscribeMessages = (chatId: string, callback: (msgs: ChatMessage[]) => void) => {
  // Registra listener
  if (!chatListeners[chatId]) {
    chatListeners[chatId] = [];
  }
  chatListeners[chatId].push(callback);

  // Emite estado atual imediatamente
  const currentMsgs = chatStore[chatId] || [];
  setTimeout(() => callback([...currentMsgs]), 50);

  // Retorna função de cleanup
  return () => {
    const idx = chatListeners[chatId]?.indexOf(callback);
    if (idx !== undefined && idx >= 0) {
      chatListeners[chatId].splice(idx, 1);
    }
  };
};

export const markMessagesRead = async (chatId: string, uid: string) => {
  const msgs = chatStore[chatId] || [];
  msgs.forEach(m => {
    if (m.senderId !== uid) {
      m.read = true;
    }
  });
};
