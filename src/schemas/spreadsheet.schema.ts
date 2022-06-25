import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Sheet, SpreadsheetInformationDto } from 'src/google';

export type SpreadsheetDocument = SpreadsheetInformationDto & Document;

@Schema()
export class Spreadsheet {
  @Prop({ required: true, unique: true })
  spreadsheetId: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  autoRecalc: string;

  @Prop({ type: String, required: true })
  timeZone: string;

  @Prop({ type: Array, required: true })
  sheets: Sheet[];

  @Prop({ required: true })
  spreadsheetUrl: string;
}

export const SpreadsheetSchema = SchemaFactory.createForClass(Spreadsheet);
