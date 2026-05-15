import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OkSmsService } from './ok-sms.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),
  ],
  providers: [OkSmsService],
  exports: [OkSmsService],
})
export class SmsModule {}
