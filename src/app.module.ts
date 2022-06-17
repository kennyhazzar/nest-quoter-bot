import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegrafModule } from 'nestjs-telegraf';
import { GoogleService } from './google/google.service';
import { GoogleModule } from './google/google.module';
import { SpreadsheetSchema } from './schemas/spreadsheet.schema';
import { SpreadsheetInformationDto } from './google/dto/spreadsheet.dto';
import { TelegramModule } from './telegram/telegram.module';
import { session } from 'telegraf';
import { CronsModule } from './crons/crons.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['env.development.local', 'env.production.local'],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([
      { name: SpreadsheetInformationDto.name, schema: SpreadsheetSchema },
    ]),
    TelegramModule,
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_TOKEN,
      middlewares: [session()],
    }),
    GoogleModule,
    ScheduleModule.forRoot(),
    CronsModule,
  ],
  providers: [GoogleService],
})
export class AppModule {}
