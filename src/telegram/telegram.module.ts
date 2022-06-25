import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CronsService } from 'src/crons/crons.service';
import { SpreadsheetInformationDto } from 'src/google';
import { GoogleService } from 'src/google/google.service';
import { IIntervalState } from 'src/interfaces';
import { IntervalSchema, SpreadsheetSchema } from 'src/schemas';
import { TelegramUpdate } from './telegram.update';
import {
  AddIntervalWizard,
  AddSheetWizard,
  DeleteIntervalWizard,
} from 'src/telegram/wizards';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SpreadsheetInformationDto.name, schema: SpreadsheetSchema },
      { name: IIntervalState.name, schema: IntervalSchema },
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
