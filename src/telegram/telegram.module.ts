import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SpreadsheetInformationDto } from 'src/google/dto/spreadsheet.dto';
import { GoogleModule } from 'src/google/google.module';
import { GoogleService } from 'src/google/google.service';
import { SpreadsheetSchema } from 'src/schemas/spreadsheet.schema';
import { TelegramUpdate } from './telegram.update';

@Module({
  imports: [
    GoogleModule,
    MongooseModule.forFeature([
      { name: SpreadsheetInformationDto.name, schema: SpreadsheetSchema },
    ]),
  ],
  providers: [GoogleService, TelegramUpdate],
})
export class TelegramModule {}
