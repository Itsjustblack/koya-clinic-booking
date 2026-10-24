import { APP_GUARD } from '@nestjs/core';
import { MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { validateEnv } from './config/env.validation.js';
import { PrismaModule } from './database/prisma.module.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { SlotsModule } from './slots/slots.module.js';
import { LoggingMiddleware } from './common/middleware/logging.middleware.js';
import { ApiKeyGuard } from './common/guards/api-key.guard.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV ?? 'development'}`,
        '.env.local',
        '.env',
      ],
      validate: validateEnv,
    }),
    PrismaModule,
    SlotsModule,
    BookingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
