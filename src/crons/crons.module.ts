import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SpreadsheetInformationDto } from 'src/google';
import { GoogleService } from 'src/google/google.service';
import { IIntervalState } from 'src/interfaces';
import { IntervalSchema, SpreadsheetSchema } from 'src/schemas';
import { CronsService } from './crons.service';

@Module({
  providers: [CronsService, GoogleService],
  imports: [
    MongooseModule.forFeature([
      { name: SpreadsheetInformationDto.name, schema: SpreadsheetSchema },
    ]),
    MongooseModule.forFeature([
      { name: IIntervalState.name, schema: IntervalSchema },
    ]),
  ],
})
export class CronsModule {}
