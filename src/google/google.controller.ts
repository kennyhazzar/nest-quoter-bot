import { Controller, Get, Post, Query } from '@nestjs/common';
import { SpreadsheetInformationDto } from './dto/spreadsheet.dto';
import { GoogleService } from './google.service';

@Controller('google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Post('add-sheet')
  async addSheet(@Query('id') id: string): Promise<SpreadsheetInformationDto> {
    return this.googleService.addSpreadsheet(id);
  }
  @Get('test')
  testing() {
    return 'test';
  }
}
