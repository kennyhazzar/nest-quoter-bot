import { Module } from '@nestjs/common';
import { GoogleService } from './google/google.service';

@Module({
  imports: [],
  controllers: [],
  providers: [GoogleService],
})
export class AppModule { }
