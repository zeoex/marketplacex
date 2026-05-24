import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateConversation(userId1: string, userId2: string, productId?: string) {
    // Look for existing conversation between these two users
    const existing = await this.prisma.conversation.findFirst({
      where: {
        participants: { every: { userId: { in: [userId1, userId2] } } },
        ...(productId ? { productId } : {}),
      },
      include: {
        participants: { include: { user: { select: { id: true, name: true, avatarUrl: true, username: true } } } },
        messages: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
    });

    if (existing) return existing;

    // Create new conversation
    return this.prisma.conversation.create({
      data: {
        productId,
        participants: {
          create: [{ userId: userId1 }, { userId: userId2 }],
        },
      },
      include: {
        participants: { include: { user: { select: { id: true, name: true, avatarUrl: true, username: true } } } },
        messages: true,
      },
    });
  }

  async getConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        participants: { include: { user: { select: { id: true, name: true, avatarUrl: true, username: true } } } },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!participant) throw new ForbiddenException('Not a participant');

    const skip = (page - 1) * limit;
    const messages = await this.prisma.message.findMany({
      where: { conversationId, deletedAt: null },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Mark messages as read
    await this.prisma.message.updateMany({
      where: { conversationId, receiverId: userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return messages.reverse();
  }

  async sendMessage(data: { conversationId: string; senderId: string; receiverId: string; content?: string; imageUrl?: string }) {
    const message = await this.prisma.message.create({
      data,
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
    });

    await this.prisma.conversation.update({
      where: { id: data.conversationId },
      data: { lastMessage: data.content?.substring(0, 100), lastMessageAt: new Date() },
    });

    // Increment unread count for receiver
    await this.prisma.conversationParticipant.updateMany({
      where: { conversationId: data.conversationId, userId: data.receiverId },
      data: { unreadCount: { increment: 1 } },
    });

    return message;
  }
}
