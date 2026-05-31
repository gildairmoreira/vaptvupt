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
  balance: number;
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
// FUNÇÕES DE USUÁRIO
// ========================

export const getUser = async (uid: string): Promise<UserData | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .single();

    if (error || !data) return null;

    return {
      uid: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      phone: data.phone || undefined,
      photoUrl: data.photo_url || undefined,
    };
  } catch (err) {
    return null;
  }
};

export const createProfile = async (userData: { uid: string, email: string, role: string, name: string }) => {
  try {
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: userData.uid,
        email: userData.email,
        role: userData.role,
        name: userData.name,
      });

    if (userError) {
      console.error('Erro ao salvar perfil no Supabase:', userError.message);
      return;
    }

    if (userData.role === 'provider') {
      const { error: provError } = await supabase
        .from('providers')
        .insert({
          id: userData.uid,
          categories: [],
          available: true,
          rating: 0,
          review_count: 0,
        });
        
      if (provError) {
        console.error('Erro ao salvar perfil de provider no Supabase:', provError.message);
      }
    }
  } catch (err) {
    console.error('Erro de conexão ao salvar perfil:', err);
  }
};

export const updateUser = async (uid: string, data: any) => {
  const updates: any = {};
  if (data.name) updates.name = data.name;
  if (data.phone) updates.phone = data.phone;
  if (data.photoUrl) updates.photo_url = data.photoUrl;
  
  await supabase.from('users').update(updates).eq('id', uid);
};

// ========================
// FUNÇÕES DE PRESTADOR
// ========================

export const createService = async (data: any) => {
  const { data: prov } = await supabase.from('providers').select('categories').eq('id', data.provider_id).single();
  if (prov) {
    const categories = Array.from(new Set([...prov.categories, data.category]));
    await supabase.from('providers').update({
      categories,
      base_price: data.base_price,
      latitude: data.location?.latitude,
      longitude: data.location?.longitude,
      bio: data.description,
      available: true
    }).eq('id', data.provider_id);
  }
};

export const subscribeAvailableProviders = (callback: (providers: ProviderData[]) => void) => {
  const fetchProviders = async () => {
    const { data } = await supabase.from('providers').select('*, users!inner(name, photo_url)').eq('available', true);
    if (data) {
      callback(data.map(p => ({
        uid: p.id,
        name: p.users.name,
        photoUrl: p.users.photo_url,
        categories: p.categories,
        location: p.latitude && p.longitude ? { latitude: p.latitude, longitude: p.longitude } : null,
        basePrice: p.base_price,
        available: p.available,
        rating: p.rating,
        reviewCount: p.review_count,
        verified: p.verified,
        bio: p.bio,
        balance: p.balance || 0
      })));
    }
  };
  fetchProviders();

  const sub = supabase.channel('public:providers')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'providers' }, fetchProviders)
    .subscribe();

  return () => { supabase.removeChannel(sub); };
};

export const searchProviders = async (query: string): Promise<ProviderData[]> => {
  const { data } = await supabase.from('providers').select('*, users!inner(name, photo_url)').eq('available', true);
  if (!data) return [];
  
  const q = query.toLowerCase();

  // Mapa de termos em PT-BR para keys internas em inglês
  const categoryMap: Record<string, string> = {
    'encanador': 'plumbing', 'encanamento': 'plumbing',
    'eletricista': 'electrical', 'elétrica': 'electrical', 'eletrica': 'electrical',
    'faxina': 'cleaning', 'limpeza': 'cleaning', 'faxineira': 'cleaning',
    'montagem': 'assembly', 'montador': 'assembly',
    'pintura': 'painting', 'pintor': 'painting',
    'jardinagem': 'gardening', 'jardineiro': 'gardening', 'jardineira': 'gardening', 'jardim': 'gardening',
    'ar-condicionado': 'aircon', 'ar condicionado': 'aircon', 'ar-cond.': 'aircon', 'ar cond': 'aircon',
    'marcenaria': 'carpentry', 'marceneiro': 'carpentry',
    'mudança': 'moving', 'mudanca': 'moving',
    'outros': 'other', 'outro': 'other',
  };

  // Lista de keys válidas de categorias (para filtro direto por key)
  const validKeys = ['plumbing', 'electrical', 'cleaning', 'assembly', 'painting', 'gardening', 'aircon', 'carpentry', 'moving', 'other'];

  const providers = data.map(p => ({
    uid: p.id,
    name: p.users.name,
    photoUrl: p.users.photo_url,
    categories: p.categories,
    location: p.latitude && p.longitude ? { latitude: p.latitude, longitude: p.longitude } : null,
    basePrice: p.base_price,
    available: p.available,
    rating: p.rating,
    reviewCount: p.review_count,
    verified: p.verified,
    bio: p.bio,
    balance: p.balance || 0
  }));

  return providers.filter(p => {
    // Busca por nome do prestador
    if (p.name.toLowerCase().includes(q)) return true;
    // Se a query é diretamente uma key válida (ex: "plumbing")
    if (validKeys.includes(q) && p.categories.includes(q)) return true;
    // Mapeamento de PT-BR para key inglesa
    const mappedCat = categoryMap[q];
    if (mappedCat && p.categories.includes(mappedCat)) return true;
    // Busca parcial nas categorias
    if (p.categories.some((c: string) => c.includes(q))) return true;
    return false;
  });
};

export const getProvider = async (id: string): Promise<ProviderData | null> => {
  const { data } = await supabase.from('providers').select('*, users!inner(name, photo_url)').eq('id', id).single();
  if (!data) return null;
  return {
    uid: data.id, name: data.users.name, photoUrl: data.users.photo_url,
    categories: data.categories, location: data.latitude && data.longitude ? { latitude: data.latitude, longitude: data.longitude } : null,
    basePrice: data.base_price, available: data.available, rating: data.rating,
    reviewCount: data.review_count, verified: data.verified, bio: data.bio,
    balance: data.balance || 0
  };
};

export const getProviderData = getProvider;

export const updateProviderData = async (uid: string, data: Partial<ProviderData>) => {
  const updates: any = {};
  if (data.categories) updates.categories = data.categories;
  if (data.basePrice !== undefined) updates.base_price = data.basePrice;
  if (data.location) { updates.latitude = data.location.latitude; updates.longitude = data.location.longitude; }
  if (data.bio !== undefined) updates.bio = data.bio;
  if (data.available !== undefined) updates.available = data.available;
  await supabase.from('providers').update(updates).eq('id', uid);
};

export const setProviderAvailability = async (uid: string, available: boolean) => {
  await supabase.from('providers').update({ available }).eq('id', uid);
};

// ========================
// AVALIAÇÕES
// ========================

export const getProviderReviews = async (id: string): Promise<Review[]> => {
  const { data } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, users(name)')
    .eq('provider_id', id)
    .order('created_at', { ascending: false });

  if (!data) return [];
  
  return data.map((r: any) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    authorName: r.users?.name || 'Cliente',
    createdAt: new Date(r.created_at)
  }));
};

export const saveReview = async (reviewData: { requestId: string; clientId: string; providerId: string; rating: number; comment?: string }) => {
  const { error } = await supabase.from('reviews').insert({
    "requestId": reviewData.requestId,
    "providerId": reviewData.providerId,
    "clientId": reviewData.clientId,
    rating: reviewData.rating,
    comment: reviewData.comment || null
  });
  if (error) throw new Error(error.message);
};

// ========================
// FUNÇÕES DE SOLICITAÇÃO
// ========================

export const createServiceRequest = async (data: ServiceRequest): Promise<string> => {
  const { data: res, error } = await supabase.from('service_requests').insert({
    client_id: data.clientId,
    provider_id: data.providerId || null,
    service_type: data.serviceType,
    status: data.status,
    latitude: data.location.latitude,
    longitude: data.location.longitude,
    description: data.description,
    is_urgent: data.isUrgent,
    estimated_price: data.estimatedPrice
  }).select().single();
  
  if (error || !res) throw new Error(error?.message || "Failed to create request");
  return res.id;
};

export const updateRequestStatus = async (requestId: string, status: string, providerId?: string): Promise<void> => {
  const updates: any = { status };
  if (providerId) updates.provider_id = providerId;
  await supabase.from('service_requests').update(updates).eq('id', requestId);
};

export const getRequest = async (requestId: string): Promise<ServiceRequest | null> => {
  const { data } = await supabase.from('service_requests').select('*').eq('id', requestId).single();
  if (!data) return null;
  return {
    id: data.id, clientId: data.client_id, providerId: data.provider_id,
    serviceType: data.service_type, status: data.status as any,
    location: { latitude: data.latitude, longitude: data.longitude },
    description: data.description, isUrgent: data.is_urgent,
    estimatedPrice: data.estimated_price, createdAt: data.created_at
  };
};

export const subscribeRequest = (requestId: string, callback: (req: ServiceRequest) => void) => {
  const fetchReq = async () => {
    const req = await getRequest(requestId);
    if (req) callback(req);
  };
  fetchReq();
  const sub = supabase.channel(`req_${requestId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests', filter: `id=eq.${requestId}` }, fetchReq)
    .subscribe();
  return () => { supabase.removeChannel(sub); };
};

export const subscribePendingRequests = (callback: (reqs: ServiceRequest[]) => void) => {
  const fetchReqs = async () => {
    const { data } = await supabase.from('service_requests').select('*').eq('status', 'pending');
    if (data) {
      callback(data.map(d => ({
        id: d.id, clientId: d.client_id, providerId: d.provider_id,
        serviceType: d.service_type, status: d.status as any,
        location: { latitude: d.latitude, longitude: d.longitude },
        description: d.description, isUrgent: d.is_urgent,
        estimatedPrice: d.estimated_price, createdAt: d.created_at
      })));
    }
  };
  fetchReqs();
  const sub = supabase.channel('pending_reqs')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests', filter: 'status=eq.pending' }, fetchReqs)
    .subscribe();
  return () => { supabase.removeChannel(sub); };
};

export const getUserRequests = async (uid: string) => {
  const { data } = await supabase.from('service_requests').select('*').eq('client_id', uid).order('created_at', { ascending: false });
  if (!data) return [];
  return data.map(d => ({
    id: d.id, clientId: d.client_id, providerId: d.provider_id, serviceType: d.service_type, status: d.status as any,
    location: { latitude: d.latitude, longitude: d.longitude }, description: d.description, isUrgent: d.is_urgent,
    estimatedPrice: d.estimated_price, createdAt: d.created_at
  }));
};

export const getProviderRequests = async (uid: string) => {
  const { data } = await supabase.from('service_requests').select('*').eq('provider_id', uid).order('created_at', { ascending: false });
  if (!data) return [];
  return data.map(d => ({
    id: d.id, clientId: d.client_id, providerId: d.provider_id, serviceType: d.service_type, status: d.status as any,
    location: { latitude: d.latitude, longitude: d.longitude }, description: d.description, isUrgent: d.is_urgent,
    estimatedPrice: d.estimated_price, createdAt: d.created_at
  }));
};

// Alias para getClientHistory (usado no histórico do cliente)
export const getClientHistory = getUserRequests;

// ========================
// SALDO DO PRESTADOR
// ========================

// Adiciona valor ao saldo do prestador no banco
export const addProviderBalance = async (uid: string, amount: number): Promise<void> => {
  // Busca saldo atual
  const { data } = await supabase.from('providers').select('balance').eq('id', uid).single();
  const currentBalance = data?.balance || 0;
  const newBalance = currentBalance + amount;
  await supabase.from('providers').update({ balance: newBalance }).eq('id', uid);
};

// Busca saldo do prestador
export const getProviderBalance = async (uid: string): Promise<number> => {
  const { data } = await supabase.from('providers').select('balance').eq('id', uid).single();
  return data?.balance || 0;
};

// ========================
// CHAT 
// ========================

export const getOrCreateChat = async (reqId: string, clientId: string, provId: string) => {
  const { data } = await supabase.from('chats').select('id').eq('request_id', reqId).single();
  if (data) return data.id;
  
  const { data: newChat, error } = await supabase.from('chats').insert({ 
    request_id: reqId, 
    client_id: clientId, 
    provider_id: provId 
  }).select().single();
  
  if (error || !newChat) throw new Error("Could not create chat");
  return newChat.id;
};

export const sendMessage = async (chatId: string, msg: ChatMessage) => {
  await supabase.from('messages').insert({ 
    chat_id: chatId, 
    sender_id: msg.senderId, 
    text: msg.text, 
    read: false 
  });
};

export const subscribeMessages = (chatId: string, callback: (msgs: ChatMessage[]) => void) => {
  const fetchMsgs = async () => {
    const { data } = await supabase.from('messages')
      .select('*, users!inner(name)')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
      
    if (data) {
      callback(data.map(d => ({ 
        id: d.id, 
        chatId: d.chat_id, 
        senderId: d.sender_id, 
        senderName: d.users.name, 
        text: d.text, 
        read: d.read, 
        createdAt: d.created_at 
      })));
    }
  };
  
  fetchMsgs();
  const sub = supabase.channel(`chat_${chatId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` }, fetchMsgs)
    .subscribe();
    
  return () => { supabase.removeChannel(sub); };
};

export const markMessagesRead = async (chatId: string, uid: string) => {
  await supabase.from('messages').update({ read: true }).eq('chat_id', chatId).neq('sender_id', uid);
};
