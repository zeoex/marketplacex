import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { redisStore } from 'cache-manager-redis-yet';
import { HealthController } from './health/health.controller';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ReportsModule } from './reports/reports.module';
import { FollowersModule } from './followers/followers.module';
import { SearchModule } from './search/search.module';
import { UploadsModule } from './uploads/uploads.module';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  controllers: [HealthController],
  imports: [
    // Config
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('THROTTLE_TTL', 60) * 1000,
          limit: config.get('THROTTLE_LIMIT', 100),
        },
      ],
    }),

    // Cache (Redis with memory fallback)
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const host = config.get('REDIS_HOST');
        if (!host) return { ttl: 60 * 5 * 1000 }; // memory store fallback
        try {
          const store = await redisStore({
            socket: { host, port: config.get('REDIS_PORT', 6379) },
            password: config.get('REDIS_PASSWORD'),
            ttl: 60 * 5 * 1000,
          });
          return { store };
        } catch {
          console.warn('Redis unavailable — falling back to memory cache');
          return { ttl: 60 * 5 * 1000 };
        }
      },
    }),

    // Cron jobs
    ScheduleModule.forRoot(),

    // Feature modules
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    PaymentsModule,
    MessagesModule,
    NotificationsModule,
    ReviewsModule,
    FavoritesModule,
    ReportsModule,
    FollowersModule,
    SearchModule,
    UploadsModule,
    AdminModule,
  ],
})
export class AppModule {}
