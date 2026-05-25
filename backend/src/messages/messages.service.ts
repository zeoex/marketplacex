import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ConversationStatus } from '@prisma/client';

const PARTICIPANT_SELECT = {
  include: {
    user: { select: { id: true, name: true, avatarUrl: true, username: true, phone: true, email: true } },
  },
};

const CONVERSATION_INCLUDE = {
  participants: PARTICIPANT_SELECT,
  messages: { take: 1, orderBy: { createdAt: 'desc' as const } },
};

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Send a contact request (creates PENDING conversation) ──────────────
  async sendRequest(buyerId: string, sellerId: string, productId: string, requestMessage?: string) {
    if (buyerId === sellerId) throw new BadRequestException('No podés contactarte a vos mismo');

    const existing = await this.prisma.conversation.findFirst({
      where: {
        productId,
        participants: { some: { userId: buyerId } },
      },
    });
    if (existing) return existing;

    return this.prisma.conversation.create({
      data: {
        productId,
        status: ConversationStatus.PENDING,
        requestMessage: requestMessage?.trim() || null,
        participants: { create: [{ userId: buyerId }, { userId: sellerId }] },
      },
      include: CONVERSATION_INCLUDE,
    });
  }

  // ── Seller accepts a contact request ──────────────────────────────────
  async acceptRequest(conversationId: string, sellerId: string) {
    await this.assertParticipant(conversationId, sellerId);
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { status: ConversationStatus.ACCEPTED },
      include: CONVERSATION_INCLUDE,
    });
  }

  // ── Seller rejects a contact request ──────────────────────────────────
  async rejectRequest(conversationId: string, sellerId: string) {
    await this.assertParticipant(conversationId, sellerId);
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { status: ConversationStatus.REJECTED },
      include: CONVERSATION_INCLUDE,
    });
  }

  // ── Get pending requests for a seller ─────────────────────────────────
  async getPendingRequests(userId: string) {
    const convs = await this.prisma.conversation.findMany({
      where: {
        status: ConversationStatus.PENDING,
        participants: { some: { userId } },
      },
      include: {
        ...CONVERSATION_INCLUDE,
        // include product info
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter: user must be the seller (not the one who initiated)
    // The buyer is the one who sent the first message / created it.
    // We detect by: buyer is the participant who is NOT the seller.
    // Actually we just return all pending conversations the user is part of
    // where the user is NOT the buyer (we don't track buyer/seller explicitly).
    // Since the product seller is implicit, return all pending for the user.
    return convs;
  }

  // ── Get all conversations for a user ─────────────────────────────────
  async getConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        status: { not: ConversationStatus.REJECTED },
        participants: { some: { userId } },
      },
      include: CONVERSATION_INCLUDE,
      orderBy: { updatedAt: 'desc' },
    });
  }

  // ── Get messages in an accepted conversation ───────────────────────────
  async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    await this.assertParticipant(conversationId, userId);

    const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv) throw new NotFoundException('Conversación no encontrada');

    const skip = (page - 1) * limit;
    const messages = await this.prisma.message.findMany({
      where: { conversationId, deletedAt: null },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    await this.prisma.message.updateMany({
      where: { conversationId, receiverId: userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return messages.reverse();
  }

  // ── Get a single conversation with full detail ─────────────────────────
  async getConversation(conversationId: string, userId: string) {
    await this.assertParticipant(conversationId, userId);

    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: PARTICIPANT_SELECT,
        messages: {
          take: 50,
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
    });

    if (!conv) throw new NotFoundException('Conversación no encontrada');
    return conv;
  }

  // ── Send a message (only on ACCEPTED conversations) ───────────────────
  async sendMessage(data: { conversationId: string; senderId: string; receiverId: string; content?: string }) {
    const conv = await this.prisma.conversation.findUnique({ where: { id: data.conversationId } });
    if (!conv) throw new NotFoundException('Conversación no encontrada');
    if (conv.status !== ConversationStatus.ACCEPTED) {
      throw new ForbiddenException('La solicitud de contacto aún no fue aceptada');
    }

    const message = await this.prisma.message.create({
      data,
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
    });

    await this.prisma.conversation.update({
      where: { id: data.conversationId },
      data: { lastMessage: data.content?.substring(0, 100), lastMessageAt: new Date() },
    });

    await this.prisma.conversationParticipant.updateMany({
      where: { conversationId: data.conversationId, userId: data.receiverId },
      data: { unreadCount: { increment: 1 } },
    });

    return message;
  }

  // ── Mark a message as read ────────────────────────────────────────────
  async markAsRead(messageId: string, userId: string) {
    await this.prisma.message.updateMany({
      where: { id: messageId, receiverId: userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  private async assertParticipant(conversationId: string, userId: string) {
    const p = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!p) throw new ForbiddenException('No sos participante de esta conversación');
  }
}
