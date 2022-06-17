import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CronsService } from 'src/crons/crons.service';
import { SpreadsheetInformationDto } from 'src/google/dto/spreadsheet.dto';
import { GoogleService } from 'src/google/google.service';
import { SpreadsheetSchema } from 'src/schemas/spreadsheet.schema';
import { TelegramUpdate } from './telegram.update';
import { AddIntervalWizard } from './wizards/add-interval.wizard';
import { DeleteIntervalWizard } from './wizards/delete-interval.wizard';
import { AddSheetWizard } from './wizards/sheet.wizard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SpreadsheetInformationDto.name, schema: SpreadsheetSchema },
    ]),
  ],
  providers: [
    GoogleService,
    TelegramUpdate,
    CronsService,
    AddSheetWizard,
    AddIntervalWizard,
    DeleteIntervalWizard,
  ],
})
export class TelegramModule {}
