// Strings localizadas em PT-BR — VaptVupt
// Centraliza toda a copy da interface para facilitar manutenção e consistência

export const strings = {
  // ========================
  // GERAL
  // ========================
  appName: "VaptVupt",
  tagline: "Serviços na palma da mão",
  loading: "Carregando...",
  error: "Algo deu errado. Tente novamente.",
  retry: "Tentar novamente",
  cancel: "Cancelar",
  confirm: "Confirmar",
  save: "Salvar",
  close: "Fechar",
  back: "Voltar",

  // ========================
  // ONBOARDING
  // ========================
  onboarding: {
    skip: "Pular introdução",
    next: "Próximo",
    start: "Comece agora",
    slide1: {
      title: "Bem-vindo ao",
      titleBrand: "VaptVupt",
      subtitle: "Conectamos você aos melhores prestadores da sua região em tempo real.",
    },
    slide2: {
      title: "Agilidade é o",
      titleHighlight: "nosso forte",
      subtitle: "Solicite qualquer serviço com apenas um toque no mapa.",
      badge: "EXPRESS",
      etaBadge: "2 MIN",
    },
    slide3: {
      title: "Confiança e Qualidade",
      subtitle: "Todos os prestadores são verificados e avaliados pela comunidade.",
      badge1: "ANTECEDENTES OK",
      badge2: "VERIFICADA",
      label1: "Pontualidade",
      label2: "Qualidade",
    },
    slide4: {
      title: "Pronto para começar?",
      titleHighlight: "Seu primeiro serviço espera.",
      subtitle: "Crie sua conta e encontre o prestador ideal agora mesmo.",
    },
  },

  // ========================
  // AUTH
  // ========================
  auth: {
    email: "Email",
    emailPlaceholder: "seu@email.com",
    password: "Senha",
    passwordPlaceholder: "Mínimo 6 caracteres",
    name: "Nome completo",
    namePlaceholder: "Como devemos te chamar?",
    forgotPassword: "Esqueceu a senha?",
    loginBtn: "Entrar",
    signupBtn: "Criar conta",
    googleBtn: "Continuar com Google",
    noAccount: "Não tem conta?",
    hasAccount: "Já tem conta?",
    signupLink: "Criar conta",
    loginLink: "Entrar",
    terms: "Termos de Serviço",
    privacy: "Política de Privacidade",
    termsText: "Ao continuar, você concorda com nossos",
    and: "e",
    resetPassword: "Redefinir Senha",
    resetPasswordSent: "Email de redefinição enviado! Verifique sua caixa de entrada.",
    chooseRole: "Como você quer usar o VaptVupt?",
    roleClient: "Sou Cliente",
    roleClientSub: "Preciso de serviços",
    roleProvider: "Sou Prestador",
    roleProviderSub: "Quero oferecer serviços",
    categories: "Quais serviços você oferece?",
  },

  // ========================
  // NAVEGAÇÃO (Tabs)
  // ========================
  tabs: {
    home: "Início",
    search: "Buscar",
    requests: "Solicitações",
    profile: "Perfil",
    dashboard: "Dashboard",
    wallet: "Carteira",
    history: "Histórico",
  },

  // ========================
  // HOME DO CLIENTE
  // ========================
  home: {
    greeting: "Olá,",
    question: "O que você precisa agora?",
    searchPlaceholder: "Ex: consertar torneira, pintar sala...",
    nearbyProviders: "Prestadores próximos",
    featuredProviders: "Em destaque",
    categories: "Categorias",
    seeAll: "Ver todos",
    available: "Disponível",
    noProviders: "Nenhum prestador disponível na sua área no momento.",
  },

  // ========================
  // BUSCA / MAPA
  // ========================
  map: {
    searchPlaceholder: "Descreva o serviço que precisa...",
    filterAll: "Todos",
    applying: "Buscando prestadores...",
    sortBy: "Ordenar por",
    distance: "Distância",
    rating: "Avaliação",
    price: "Preço",
    requestNow: "Solicitar Agora",
    viewDetails: "Ver Detalhes",
    urgentBadge: "URGENTE",
    away: "de distância",
  },

  // ========================
  // DETALHE DO PRESTADOR
  // ========================
  provider: {
    verified: "VERIFICADO",
    backgroundOk: "ANTECEDENTES OK",
    eta: "Tempo estimado",
    basePrice: "A partir de",
    ratings: "avaliações",
    reviews: "Avaliações recentes",
    bio: "Sobre",
    categories: "Serviços oferecidos",
    requestService: "Solicitar Serviço",
    notAvailable: "Prestador indisponível no momento",
    unavailable: "Indisponível",
  },

  // ========================
  // SOLICITAÇÃO / STATUS
  // ========================
  request: {
    status: {
      pending: "Solicitação enviada",
      accepted: "Solicitação aceita!",
      on_the_way: "A caminho",
      completed: "Serviço concluído",
      canceled: "Solicitação cancelada",
    },
    statusDesc: {
      pending: "Aguardando o prestador confirmar...",
      accepted: "O prestador confirmou e está se preparando.",
      on_the_way: "O prestador está a caminho da sua localização.",
      completed: "Serviço concluído com sucesso!",
      canceled: "A solicitação foi cancelada.",
    },
    cancelBtn: "Cancelar Solicitação",
    whatsapp: "Chamar no WhatsApp",
    urgent: "URGENTE",
    chat: "Abrir Chat",
    cancelConfirm: "Tem certeza que deseja cancelar?",
    cancelWarning: "Esta ação não pode ser desfeita.",
  },

  // ========================
  // AVALIAÇÃO
  // ========================
  rate: {
    title: "Rate Service",
    question: "Como foi o serviço?",
    tap: "Toque para avaliar",
    feedback: "Seu feedback (opcional)",
    feedbackPlaceholder: "Conte sua experiência...",
    submitBtn: "Enviar Avaliação",
    successTitle: "Obrigado!",
    successSubtitle: "Sua avaliação ajuda a manter a qualidade da nossa comunidade.",
    reviewed: "REVISADO",
    backHome: "Voltar para o Início",
  },

  // ========================
  // DASHBOARD DO PRESTADOR
  // ========================
  dashboard: {
    availableToggle: "Ficar Disponível",
    unavailableToggle: "Indisponível",
    todayEarnings: "Ganhos hoje",
    completedServices: "Serviços feitos",
    avgRating: "Avaliação média",
    pendingRequests: "Solicitações próximas",
    noRequests: "Nenhuma solicitação no momento.",
    urgentBadge: "URGENTE",
    scheduledBadge: "AGENDADA",
    acceptNow: "Aceitar Agora",
    decline: "Recusar",
    viewRequest: "Ver solicitação",
  },

  // ========================
  // CARTEIRA
  // ========================
  wallet: {
    title: "Carteira",
    balance: "Saldo disponível",
    withdraw: "Solicitar Saque",
    withdrawComingSoon: "Em breve",
    history: "Histórico de ganhos",
    noHistory: "Nenhum ganho registrado ainda.",
  },

  // ========================
  // PERFIL
  // ========================
  profile: {
    title: "Perfil",
    editProfile: "Editar Perfil",
    modeToggle: "Mudar para Modo Prestador",
    modeToggleClient: "Mudar para Modo Cliente",
    history: "Meu Histórico",
    wallet: "Carteira",
    payments: "Métodos de Pagamento",
    help: "Ajuda e Suporte",
    logout: "Sair",
    logoutConfirm: "Deseja realmente sair?",
    availability: "Disponibilidade",
    performance: "Meu Desempenho",
    services: "Meus Serviços",
  },

  // ========================
  // CATEGORIAS
  // ========================
  categories: {
    all: "Todos",
    plumbing: "Encanamento",
    electrical: "Elétrica",
    painting: "Pintura",
    cleaning: "Limpeza",
    assembly: "Montagem",
    carpentry: "Marcenaria",
    aircon: "Ar-condicionado",
    moving: "Mudança",
    gardening: "Jardinagem",
    other: "Outros",
  },

  // ========================
  // ERROS
  // ========================
  errors: {
    emailRequired: "Email é obrigatório",
    emailInvalid: "Email inválido",
    passwordRequired: "Senha é obrigatória",
    passwordShort: "Senha deve ter pelo menos 6 caracteres",
    nameRequired: "Nome é obrigatório",
    roleRequired: "Selecione seu perfil para continuar",
    loginFailed: "Email ou senha incorretos. Tente novamente.",
    signupFailed: "Não foi possível criar sua conta. Tente novamente.",
    networkError: "Sem conexão com a internet. Verifique sua rede.",
    locationPermission: "Permissão de localização necessária para usar o VaptVupt.",
    noService: "Nenhum prestador encontrado para este serviço.",
  },
} as const;

// Tipo exportado para uso com autocompletar TypeScript
export type Strings = typeof strings;
