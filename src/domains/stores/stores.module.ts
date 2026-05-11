import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { UsersModule } from '../users/users.module';
import { PublicDataModule } from '../../infrastructure/public-data/public-data.module';
import { Store } from './entities/store.entity';
import { StoreStaff } from './entities/store-staff.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store, StoreStaff]),
    UsersModule,
    PublicDataModule,
  ],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}
