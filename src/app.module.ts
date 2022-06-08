import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegrafModule } from 'nestjs-telegraf';
import { GoogleService } from './google/google.service';
import { GoogleController } from './google/google.controller';
import { GoogleModule } from './google/google.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['env.development.local', 'env.production.local'],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_TOKEN,
    }),
    GoogleModule,
  ],
  controllers: [GoogleController],
  providers: [GoogleService],
})
export class AppModule {}
