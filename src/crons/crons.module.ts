import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SpreadsheetInformationDto } from 'src/google/dto/spreadsheet.dto';
import { GoogleService } from 'src/google/google.service';
import { SpreadsheetSchema } from 'src/schemas/spreadsheet.schema';
import { CronsService } from './crons.service';

@Module({
  providers: [CronsService, GoogleService],
  imports: [
    MongooseModule.forFeature([
      { name: SpreadsheetInformationDto.name, schema: SpreadsheetSchema },
    ]),
  ],
})
export class CronsModule {}
