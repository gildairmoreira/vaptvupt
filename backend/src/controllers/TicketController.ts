import { Request, Response } from 'express';
import { TicketService } from '../services/TicketService';

const ticketService = new TicketService();

export class TicketController {
  async create(req: Request, res: Response) {
    try {
      const { clientId, type, isUrgent, latitude, longitude, maxRadiusKm, scheduledFor } = req.body;
      
      const ticket = await ticketService.createTicket({
        clientId,
        type,
        isUrgent,
        latitude,
        longitude,
        maxRadiusKm,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined
      });

      return res.status(201).json({ success: true, ticket });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: 'Erro ao criar ticket' });
    }
  }

  async accept(req: Request, res: Response) {
    try {
      const ticketId = req.params.ticketId as string;
      const providerId = req.body.providerId as string;

      const ticket = await ticketService.acceptTicket(ticketId, providerId);
      return res.status(200).json({ success: true, ticket });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: 'Erro ao aceitar ticket' });
    }
  }
}
