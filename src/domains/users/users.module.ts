import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserTerm } from './entities/user-term.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserTerm])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // AuthModule에서 사용
})
export class UsersModule {}
