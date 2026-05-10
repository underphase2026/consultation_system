import { Module } from '@nestjs/common';
import { PublicDataService } from './public-data.service';
import { BUSINESS_VERIFY_SERVICE } from './interfaces/business-verify.interface';

@Module({
  providers: [
    PublicDataService,
    {
      provide: BUSINESS_VERIFY_SERVICE,
      useClass: PublicDataService,
    },
  ],
  exports: [BUSINESS_VERIFY_SERVICE, PublicDataService],
})
export class PublicDataModule {}
