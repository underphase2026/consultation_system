import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { UsersModule } from '../users/users.module';
import { PublicDataModule } from '../../infrastructure/public-data/public-data.module';

@Module({
  imports: [UsersModule, PublicDataModule],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}
