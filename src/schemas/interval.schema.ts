import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IIntervalState } from 'src/interfaces/interval-state.interface';

export type IntervalDocument = IIntervalState & Document;

@Schema()
export class Interval {
  @Prop({ required: true, unique: true, type: String })
  name: string;
  @Prop({ required: true, unique: false, type: Number })
  time: number;
  @Prop({ required: true, unique: false, type: String })
  list: string;
}

export const IntervalSchema = SchemaFactory.createForClass(Interval);
