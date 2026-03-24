import express from 'express';
import http from 'http';
import { ProviderGateway } from './gateways/ProviderGateway';
import { TicketController } from './controllers/TicketController';

const app = express();
const server = http.createServer(app);

// Middlewares básicos
app.use(express.json());

// Gateways (WebSockets - Recebe o servidor HTTP nativo)
const providerGateway = new ProviderGateway(server);

// Controllers (Lógica REST)
const ticketController = new TicketController();

// Rotas REST da API
app.post('/api/tickets', ticketController.create.bind(ticketController));
app.post('/api/tickets/:ticketId/accept', ticketController.accept.bind(ticketController));

// Rota de Healthcheck
app.get('/', (req, res) => {
  res.send('API de Geolocalização Operacional 🚀');
});

// Inicialização da porta
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`\n================================`);
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 WebSocket Gateway ouvindo conexões...`);
  console.log(`================================\n`);
});
