import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SpreadsheetInformationDto } from 'src/google/dto/spreadsheet.dto';
import { GoogleService } from 'src/google/google.service';
import { SpreadsheetSchema } from 'src/schemas/spreadsheet.schema';
import { TelegramUpdate } from './telegram.update';
import { AddSheetWizard } from './wizards/sheet.wizard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SpreadsheetInformationDto.name, schema: SpreadsheetSchema },
    ]),
  ],
  providers: [GoogleService, TelegramUpdate, AddSheetWizard],
})
export class TelegramModule {}
