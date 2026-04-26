# Arquitetura e Stack de Geolocalização

## 1. Stack Tecnológica Sugerida

Para um sistema com alta dependência de geolocalização em tempo real e conexões persistentes, a performance e o ecossistema são fundamentais.

### Front-end Mobile (App Cliente e Prestador)
* **Framework:** React Native (com Expo no modelo Bare Workflow ou CLI puro). Excelente para manter uma única base de código (iOS e Android).
* **Mapas:** `react-native-maps` (integrado nativamente com Apple Maps no iOS e Google Maps no Android).
* **Background Location:** `expo-location` ou `react-native-background-geolocation` (biblioteca premium altamente confiável para tracking de bateria eficiente em background).
* **Comunicação Tempo Real:** `socket.io-client` ou `WebSockets` nativos.

### Back-end e APIs
* **Linguagem/Framework:** Node.js com NestJS (TypeScript). Arquitetura modular excelente para escalar microsserviços.
* **Comunicação Real-time:** Socket.io ou um Message Broker como Redis Pub/Sub para lidar com o broadcast de localizações para múltiplos clientes em áreas específicas.
* **Fila de Tarefas:** BullMQ (para lidar com agendamentos futuros e disparos de Push Notification assíncronos).

### Bancos de Dados
* **Cache e Localização em Tempo Real:** **Redis (GEORADIUS)**. Muito mais rápido para gravar e buscar coordenadas (lat/long) recebidas a cada x segundos dos prestadores, sem onerar o banco principal.
* **Banco de Dados Principal:** **PostgreSQL com PostGIS**. Perfeito para lidar com cálculos geoespaciais avançados, cruzamento de polígonos e histórico de tickets. (Alternativa: MongoDB com índices `2dsphere`).

### Infraestrutura e APIs Externas
* **Mapas/Rotas API:** Google Maps Platform (Routes, Places) ou Mapbox.
* **Push Notifications:** Firebase Cloud Messaging (FCM) via react-native-firebase.

---

## 2. Arquitetura de Dados (Esquema Principal)

Abaixo estão as tabelas principais pensando em um modelo relacional (PostgreSQL):

### Tabela: `users` (Clientes e Prestadores)
- `id` (UUID)
- `role` (ENUM: CLIENT, PROVIDER)
- `name`, `email`, `phone`
- `status` (ENUM: ACTIVE, BLOCKED)
- `block_expires_at` (TIMESTAMP) -> *Usado para o bloqueio de 2h.*

### Tabela: `provider_skills`
- `provider_id` (FK)
- `skill_name` (Ex: Encanador, Chaveiro, Eletricista)

### Tabela: `tickets` (Demandas)
- `id` (UUID)
- `client_id` (FK)
- `assigned_provider_id` (FK, nullable)
- `status` (ENUM: SEARCHING, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELED)
- `type` (ENUM: IMMEDIATE, SCHEDULED)
- `is_urgent` (BOOLEAN) -> *Flag de urgência.*
- `location` (GEOMETRY: POINT)
- `max_radius_km` (INT)
- `created_at`, `scheduled_for`

### Tabela: `rejection_logs` (Log de Recusas)
- `id` (UUID)
- `provider_id` (FK)
- `ticket_id` (FK)
- `reason` (VARCHAR) -> *Pode ser "IGNORED" (deixou o timer expirar) ou "MANUAL_REJECT".*
- `created_at` (TIMESTAMP)

### Banco em Memória: `Redis` (Tracking)
- Chave Geoespacial: `providers:locations` (Armazena os IDs dos prestadores online e suas coordenadas (long, lat)). Atualizado via WebSocket.
