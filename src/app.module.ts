import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegrafModule } from 'nestjs-telegraf';
import { GoogleService } from './google/google.service';

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
  ],
  controllers: [],
  providers: [GoogleService],
})
export class AppModule {}
