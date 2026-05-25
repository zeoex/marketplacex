import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // ── Contact request ────────────────────────────────────────────────────
  @Post('request')
  sendRequest(
    @Body() body: { sellerId: string; productId: string; requestMessage?: string },
    @Request() req: any,
  ) {
    return this.messagesService.sendRequest(req.user.id, body.sellerId, body.productId, body.requestMessage);
  }

  @Patch('conversations/:id/accept')
  acceptRequest(@Param('id') id: string, @Request() req: any) {
    return this.messagesService.acceptRequest(id, req.user.id);
  }

  @Patch('conversations/:id/reject')
  rejectRequest(@Param('id') id: string, @Request() req: any) {
    return this.messagesService.rejectRequest(id, req.user.id);
  }

  // ── Conversations ──────────────────────────────────────────────────────
  @Get('conversations')
  getConversations(@Request() req: any) {
    return this.messagesService.getConversations(req.user.id);
  }

  @Get('conversations/:id')
  getConversation(@Param('id') id: string, @Request() req: any) {
    return this.messagesService.getConversation(id, req.user.id);
  }

  @Get('conversations/:id/messages')
  getMessages(
    @Param('id') id: string,
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.messagesService.getMessages(id, req.user.id, +page, +limit);
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @Param('id') conversationId: string,
    @Body() body: { receiverId: string; content: string },
    @Request() req: any,
  ) {
    return this.messagesService.sendMessage({
      conversationId,
      senderId: req.user.id,
      receiverId: body.receiverId,
      content: body.content,
    });
  }
}
