import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoogleService } from './google/google.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['env.development.local', 'env.production.local']
    })
  ],
  controllers: [],
  providers: [GoogleService],
})
export class AppModule { }
