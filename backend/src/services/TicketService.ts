import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateTicketDto {
  clientId: string;
  type: 'IMMEDIATE' | 'SCHEDULED';
  isUrgent: boolean;
  latitude: number;
  longitude: number;
  maxRadiusKm?: number;
  scheduledFor?: Date;
}

export class TicketService {
  async createTicket(data: CreateTicketDto) {
    const ticket = await prisma.ticket.create({
      data: {
        clientId: data.clientId,
        type: data.type,
        isUrgent: data.isUrgent,
        latitude: data.latitude,
        longitude: data.longitude,
        maxRadiusKm: data.maxRadiusKm ?? 5,
        scheduledFor: data.scheduledFor,
        status: 'SEARCHING'
      }
    });

    // Aqui acionaria o Gateway para avisar os prestadores em tempo real via Redis + WebSocket
    // ProviderGateway.notifyNearbyProviders(ticket, 'Plumber', ticket.maxRadiusKm);

    return ticket;
  }

  async acceptTicket(ticketId: string, providerId: string) {
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        assignedProviderId: providerId,
        status: 'ACCEPTED'
      }
    });
    return ticket;
  }
}
