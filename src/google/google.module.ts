import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SpreadsheetSchema } from 'src/schemas/spreadsheet.schema';
import { SpreadsheetInformationDto } from './dto/spreadsheet.dto';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SpreadsheetInformationDto.name, schema: SpreadsheetSchema },
    ]),
  ],
})
export class GoogleModule {}
