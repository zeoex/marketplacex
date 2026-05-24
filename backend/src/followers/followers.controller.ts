import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FollowersService } from './followers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('followers')
@Controller('followers')
export class FollowersController {
  constructor(private readonly followersService: FollowersService) {}

  @Get(':userId')
  getFollowers(@Param('userId') userId: string) {
    return this.followersService.getFollowers(userId);
  }

  @Get(':userId/following')
  getFollowing(@Param('userId') userId: string) {
    return this.followersService.getFollowing(userId);
  }

  @Post(':userId/toggle')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  toggle(@Param('userId') userId: string, @Request() req: any) {
    return this.followersService.toggle(req.user.id, userId);
  }
}
