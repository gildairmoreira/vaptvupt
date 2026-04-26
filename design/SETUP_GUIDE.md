# UBER EXPO - Guia de Configuração e Uso em Desenvolvimento

## ✅ O que foi consertado

### 1. **Removido Stripe (Gateway de Pagamento)**

- Arquivos removidos: `app/(api)/(stripe)/*` - rotas do gateway Stripe
- Componente atualizado: `components/Payment.tsx` - agora usa pagamento mockado
- A lógica de criação de rides mantém a estrutura de pagamento sem usar o Stripe real
- Status de pagamento é sempre "paid" em mockup

### 2. **Removido Clerk Auth Temporariamente**

- Substituída autenticação real por bypass mockado
- Arquivos atualizados:
  - `app/_layout.tsx` - removido ClerkProvider
  - `app/index.tsx` - redireciona direto para home
  - `app/(root)/(tabs)/home.tsx` - usa mock user
  - `app/(root)/(tabs)/profile.tsx` - dados de usuário mockados
  - `app/(root)/(tabs)/rides.tsx` - sem dependência de Clerk
  - `app/(root)/book-ride.tsx` - sem StripeProvider e Clerk

### 3. **Simplificado Componentes para Web**

- `components/GoogleTextInput.tsx` - versão web com TextInput simples
- `app/(root)/(tabs)/home.tsx` - removido Map e GoogleTextInput do header

---

## 🚀 Como Rodar em Desenvolvimento

### **Opção 1: Modo Native (Recomendado para Android/iOS)**

```bash
cd c:\dev\vaptvupt\uber

# Para Android (requer Android Studio/Emulador)
npm run android

# Para iOS (requer Xcode)
npm run ios

# Ou iniciar Expo Go e escanear QR code
npm start
```

### **Opção 2: Modo Web (Limitado)**

```bash
cd c:\dev\vaptvupt\uber
npm run web
```

⚠️ **Limitações do Web:**

- Mapas não funcionam (placeholder mostrado)
- Google Places Autocomplete é um TextInput simples
- Autenticação biométrica não funciona (por segurança do navegador)
- Localization é mockada

---

## 📋 Variáveis de Ambiente Necessárias

### **Arquivo `.env` (já criado com mockups):**

```env
# Autenticação - MUDE para chaves reais
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=mock_clerk_publishable_key

# Banco de Dados - MUDE para URL real
DATABASE_URL=postgresql://mockuser:mockpass@mockhost:5432/mockdb

# APIs de Mapas - MUDE para chaves reais
EXPO_PUBLIC_GOOGLE_API_KEY=mock_google_api_key
EXPO_PUBLIC_DIRECTIONS_API_KEY=mock_directions_api_key
EXPO_PUBLIC_PLACES_API_KEY=mock_places_api_key
EXPO_PUBLIC_GEOAPIFY_API_KEY=mock_geoapify_api_key

# Stripe - REMOVER quando implementar gateway real
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=mock_stripe_publishable_key
STRIPE_SECRET_KEY=mock_stripe_secret_key
```

---

## 🔧 Dependências Principais Instaladas

```json
{
  "expo": "~51.0.39",
  "react": "18.2.0",
  "react-native": "0.74.5",
  "react-native-web": "~0.19.10",
  "expo-router": "~3.5.24",
  "nativewind": "^2.0.11",
  "@clerk/clerk-expo": "^2.1.0", // Será restaurado
  "@stripe/stripe-react-native": "^0.37.2", // Será restaurado
  "react-native-maps": "^1.14.0",
  "react-native-google-places-autocomplete": "^2.5.6"
}
```

---

## 📝 Passo a Passo para Implementação Real

### **Fase 1: Configurar Autenticação (Clerk)**

1. Criar conta em [https://clerk.com](https://clerk.com)
2. Criar nova aplicação
3. Copiar `Publishable Key` e substituir em `.env`:
   ```env
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
   ```
4. Em `app/_layout.tsx`, restaurar:

   ```typescript
   import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
   import { tokenCache } from "@/lib/auth";

   const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

   return (
     <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
       <ClerkLoaded>
         {/* Stack */}
       </ClerkLoaded>
     </ClerkProvider>
   );
   ```

### **Fase 2: Configurar Banco de Dados (Neon/PostgreSQL)**

1. Criar conta em [https://neon.tech](https://neon.tech)
2. Criar novo projeto
3. Copiar connection string e substituir em `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@host.neon.tech/dbname
   ```
4. Executar migrations (se houver)

### **Fase 3: Configurar APIs de Mapas**

#### **Google Maps/Places:**

1. Ir para [Google Cloud Console](https://console.cloud.google.com)
2. Criar nova chave API
3. Ativar:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API
   - Directions API
4. Substituir em `.env`:
   ```env
   EXPO_PUBLIC_GOOGLE_API_KEY=AIzaSy...
   EXPO_PUBLIC_PLACES_API_KEY=AIzaSy...
   EXPO_PUBLIC_DIRECTIONS_API_KEY=AIzaSy...
   ```

#### **Geoapify (Alternativa opcional):**

1. Ir para [https://geoapify.com](https://geoapify.com)
2. Criar conta e copiar API key
3. Substituir em `.env`:
   ```env
   EXPO_PUBLIC_GEOAPIFY_API_KEY=...
   ```

### **Fase 4: Restaurar Stripe (Pagamentos Reais)**

1. Criar conta em [https://stripe.com](https://stripe.com)
2. Copiar chaves e substituir em `.env`:
   ```env
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   ```
3. Restaurar `components/Payment.tsx` versão original
4. Restaurar `app/(api)/(stripe)/*` com código real
5. Restaurar `app/(root)/book-ride.tsx` com StripeProvider

---

## 🧪 Testando a Aplicação

### **Mock/Development:**

```bash
npm start
# Escanear QR code com Expo Go
```

### **Android real:**

```bash
# Conectar device via USB e ativar debug
npm run android

# Ou buildar APK
eas build --platform android
```

### **iOS real:**

```bash
npm run ios
# Ou buildar via Xcode
```

---

## 📍 Estrutura de Endpoints da API

Os endpoints usam Neon + PostgreSQL e são:

- `/(api)/driver` - Lista de motoristas
- `/(api)/ride/[id]` - Rides do usuário
- `/(api)/ride/create` - Criar nova viagem
- `/(api)/(stripe)/create` - (Remover após implementar Stripe real)
- `/(api)/(stripe)/pay` - (Remover após implementar Stripe real)

---

## ⚠️ Problemas Conhecidos

1. **Web Mode**: Mapas e GooglePlaces não funcionam totalmente no navegador
2. **Android Studio Emulator**: Requer instalação local (não é emulador web)
3. **Biometria**: Não funciona no web (expo-local-authentication limitado)

---

## ✨ Próximos Passos Recomendados

1. ✅ Testar em modo native primeiro (Android/iOS)
2. ✅ Configurar banco de dados real
3. ✅ Implementar Clerk para autenticação real
4. ✅ Implementar Stripe para pagamentos
5. ✅ Depois testar web (com limitações)

---

**Status Atual**: ✅ Projeto mockado funcional para testes desktop/web básicos

Last Updated: 08-04-2026
