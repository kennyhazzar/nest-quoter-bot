import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SpreadsheetSchema } from 'src/schemas';
import { SpreadsheetInformationDto } from './dto';
import { GoogleController } from './google.controller';
import { GoogleService } from './google.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SpreadsheetInformationDto.name, schema: SpreadsheetSchema },
    ]),
  ],
  controllers: [GoogleController],
  providers: [GoogleService],
})
export class GoogleModule {}
