# VaptVupt — Marketplace de Serviços Geolocalizados

**Stack:** React Native + Expo · Firebase · Geoapify

---

## 🚀 Setup Rápido

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Edite o arquivo `.env` com suas chaves reais (já configurado com as chaves do projeto `vaptvupt-prod`):

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=vaptvupt-prod
EXPO_PUBLIC_GEOAPIFY_API_KEY=...
```

### 3. Rodar localmente
```bash
# Web (desenvolvimento)
npx expo start --web

# Android via Expo Go
npx expo start --android

# iOS via Expo Go  
npx expo start --ios
```

---

## 🔒 Deploy das Regras de Segurança Firebase

### Pré-requisitos
```bash
npm install -g firebase-tools
firebase login
firebase use vaptvupt-prod
```

### Deploy rules + indexes
```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

---

## 🗂️ Estrutura do Projeto

```
app/
├── (auth)/
│   ├── welcome.tsx        # Onboarding 4 slides
│   ├── sign-in.tsx        # Login
│   └── sign-up.tsx        # Cadastro + seleção de role
├── (client)/
│   ├── index.tsx          # Home com categorias + prestadores
│   ├── map.tsx            # Mapa + busca Geoapify + autocomplete
│   ├── provider/[id].tsx  # Detalhe do prestador
│   ├── request/[id].tsx   # Tracking em tempo real
│   ├── rate/[id].tsx      # Avaliação + tela de sucesso
│   ├── chat/[id].tsx      # Chat em tempo real
│   ├── history.tsx        # Histórico de serviços
│   └── profile.tsx        # Perfil + upload de foto
└── (provider)/
    ├── index.tsx          # Dashboard + toggle disponibilidade
    ├── wallet.tsx         # Carteira
    ├── profile.tsx        # Perfil do prestador
    ├── request/[id].tsx   # Aceitar/recusar solicitação
    └── service/create.tsx # Criar anúncio de serviço

lib/
├── firebase.ts    # Configuração Firebase
├── firestore.ts   # CRUD + listeners onSnapshot
├── geo.ts         # Haversine distance + ETA
├── geoapify.ts    # Geocoding + autocomplete
└── storage.ts     # Upload de fotos Firebase Storage

store/
├── useAuthStore.ts     # Auth + perfil do usuário
├── useRequestStore.ts  # Ciclo de vida de solicitações
└── useProviderStore.ts # Dashboard do prestador

constants/
├── theme.ts        # Kinetic Layer design tokens
└── localization.ts # Strings PT-BR
```

---

## 🎨 Design System — Kinetic Layer

| Token | Valor |
|---|---|
| `primary` | `#d83900` (laranja) |
| `secondary` | `#0058bc` (azul confiança) |
| `surface` | `#f9f9f9` |
| `radius.full` | 9999 (botões pill) |
| Sem bordas 1px | Hierarquia por cor/sombra |

---

## 📊 Coleções Firestore

| Coleção | Descrição |
|---|---|
| `users` | Perfis de usuários (client\|provider) |
| `providers` | Dados do prestador (disponibilidade, localização, rating) |
| `service_requests` | Solicitações com status em tempo real |
| `reviews` | Avaliações dos serviços |
| `chats` | Conversas vinculadas a solicitações |
| `chats/{id}/messages` | Mensagens em tempo real |

---

## ✅ Features Implementadas (MVP)

- [x] Onboarding 4 slides (Kinetic Layer)
- [x] Auth Firebase (email/senha + Google OAuth)
- [x] Dual-role: Cliente ↔ Prestador (switch no perfil)
- [x] Home com categorias e prestadores disponíveis em tempo real
- [x] Mapa com Geoapify Autocomplete + geocoding reverso
- [x] Detalhe do prestador (ETA, preço, verificado, avaliações)
- [x] Solicitação de serviço → tracking em tempo real (Firestore onSnapshot)
- [x] Chat entre cliente e prestador (Firestore mensagens)
- [x] Avaliação do serviço (5 estrelas + tela de sucesso)
- [x] Histórico de serviços
- [x] Dashboard do prestador (toggle, métricas, feed de pedidos)
- [x] Aceitar/recusar solicitações
- [x] Upload de foto de perfil (Firebase Storage)
- [x] Criar anúncio de serviço (4 etapas)
- [x] Regras de segurança Firestore + Storage
- [x] Índices compostos Firestore

## 🔜 Próximas Iterações

- [ ] Push Notifications via FCM
- [ ] Pagamentos (Pix via API ou integração futura)
- [ ] Geoapify Isoline para busca por raio preciso
- [ ] Histórico de ganhos do prestador
- [ ] Chat no painel do prestador
