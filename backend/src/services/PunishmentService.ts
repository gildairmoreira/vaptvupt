import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RejectionEvent {
  providerId: string;
  ticketId: string;
  reason: 'IGNORED' | 'MANUAL_REJECT';
}

export class PunishmentService {
  /**
   * Threshold requirements:
   * Por exemplo: Se o prestador rejeitar 3 chamados (ou ignorar) na última 1 hora,
   * ele recebe um castigo (block timeout) de 2 horas.
   */
  private static MAX_REJECTIONS_ALLOWED = 3;
  private static TIME_WINDOW_MINUTES = 60;
  private static TIMEOUT_PENALTY_HOURS = 2;

  /**
   * Processa quando um prestador recusa ativamente ou o timer da notificação expira
   */
  async processRejection(event: RejectionEvent): Promise<void> {
    const { providerId, ticketId, reason } = event;

    // 1. Grava no banco a rejeição para a auditoria
    await prisma.rejectionLog.create({
      data: {
        providerId,
        ticketId,
        reason,
        createdAt: new Date()
      }
    });

    // 2. Calcula a data/hora inicial limite (ex: 1 hora atrás)
    const timeWindowLimit = new Date();
    timeWindowLimit.setMinutes(timeWindowLimit.getMinutes() - PunishmentService.TIME_WINDOW_MINUTES);

    // 3. Busca quantas rejeições ele tem dentro do intervalo
    const recentRejectionsCount = await prisma.rejectionLog.count({
      where: {
        providerId,
        createdAt: {
          gte: timeWindowLimit
        }
      }
    });

    // 4. Se a taxa de rejeição/quantidade excedeu o limite do SLA
    if (recentRejectionsCount >= PunishmentService.MAX_REJECTIONS_ALLOWED) {
      await this.applyPenalty(providerId);
    }
  }

  /**
   * Aplica a punição alterando status e definindo o expurgo
   */
  private async applyPenalty(providerId: string): Promise<void> {
    const blockExpiration = new Date();
    blockExpiration.setHours(blockExpiration.getHours() + PunishmentService.TIMEOUT_PENALTY_HOURS);

    await prisma.user.update({
      where: { id: providerId },
      data: {
        status: 'BLOCKED',
        blockExpiresAt: blockExpiration
      }
    });

    // TODO: Adicionar lógica para injetar no WebSocket uma mensagem forçando o logout temporário
    // TODO: Remover o prestador do geospacial do Redis imediatamente
    
    console.log(`[SLA CONTROL] Provider ${providerId} blockeado até ${blockExpiration.toISOString()}`);
  }

  /**
   * Rotina (CRON JOB ou Middleware) para checar e remover blocks expirados
   */
  async clearExpiredBlocks(): Promise<void> {
    await prisma.user.updateMany({
      where: {
        status: 'BLOCKED',
        blockExpiresAt: {
          lte: new Date()
        }
      },
      data: {
        status: 'ACTIVE',
        blockExpiresAt: null
      }
    });
  }
}
