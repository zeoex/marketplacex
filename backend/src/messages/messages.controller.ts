import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  getConversations(@Request() req: any) {
    return this.messagesService.getConversations(req.user.id);
  }

  @Post('conversations')
  getOrCreateConversation(
    @Body() body: { userId: string; productId?: string },
    @Request() req: any,
  ) {
    return this.messagesService.getOrCreateConversation(req.user.id, body.userId, body.productId);
  }

  @Get('conversations/:id')
  getMessages(
    @Param('id') id: string,
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.messagesService.getMessages(id, req.user.id, +page, +limit);
  }
}
