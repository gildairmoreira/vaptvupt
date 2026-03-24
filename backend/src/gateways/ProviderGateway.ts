import { Server, Socket } from 'socket.io';
import { createClient } from 'redis';

// Inicializa o client do Redis - requer Node Redis moderno (v4+)
const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://127.0.0.1:6379' });
redisClient.connect().catch(console.error);

export class ProviderGateway {
  private io: Server;

  constructor(server: any) {
    this.io = new Server(server, { cors: { origin: '*' } });
    this.setupListeners();
  }

  private setupListeners() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[WebSocket] Prestador conectado via socket: ${socket.id}`);

      // Autenticação na conexão
      const providerId = socket.handshake.query.providerId as string;
      const skill = socket.handshake.query.skill as string;
      
      if (providerId && skill) {
        socket.join(`provider_${providerId}`); // Sala dedicada para emissão direta
      }

      // Recebe update de GPS a cada 20 segundos
      socket.on('update_location', async (data: { latitude: number; longitude: number; providerId: string; skill: string }) => {
        const { latitude, longitude, providerId, skill } = data;
        
        const key = `locations:${skill}`;
        
        // GEOADD: Atualiza no Redis. O redis armazena Longitude primeiro!
        await redisClient.geoAdd(key, {
          longitude,
          latitude,
          member: providerId
        });
        
        // Expira o índice inteiro após um tempo inativo? (Melhor usar lógica zRem se quiser)
        await redisClient.expire(key, 900); // Garante limpeza caso script trave (15 mins)
      });

      socket.on('disconnect', async () => {
        console.log(`[WebSocket] Usuário desconectado: ${socket.id}`);
        // Limpar posição do Redis
        if (providerId && skill) {
           await redisClient.zRem(`locations:${skill}`, providerId);
        }
      });
    });
  }

  /**
   * Procura prestadores num raio N e notifica sockets
   */
  async notifyNearbyProviders(ticket: any, skillRequired: string, maxRadiusKm: number) {
    try {
      // Usando GEOSEARCH do Redis > 6.2 (Busca rápida em O(N+log(M)))
      const nearbyProviders = await redisClient.geoSearchWith(
        `locations:${skillRequired}`,
        { longitude: ticket.longitude, latitude: ticket.latitude },
        { radius: maxRadiusKm, unit: 'km' },
        ['WITHDIST']
      );

      console.log(`Encontrados ${nearbyProviders.length} profissionais num raio de ${maxRadiusKm}km.`);

      // Dispara broadcast granular
      for (const provider of nearbyProviders) {
        const socketRoomToEmit = `provider_${provider.member}`;
        this.io.to(socketRoomToEmit).emit('new_ticket', ticket);
      }

    } catch (err) {
      console.error('[Gateway] Erro no Redis GEO:', err);
    }
  }
}
