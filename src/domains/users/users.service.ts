import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { Role } from '../../common/enums/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────

  async generateReferralCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let code = '';
    let isUsed = true;
    
    while (isUsed) {
      code = Array.from({ length: 6 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length)),
      ).join('');
      isUsed = await this.isReferralCodeUsed(code);
    }
    return code;
  }

  private async isReferralCodeUsed(code: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { referralCode: code } });
    return count > 0;
  }

  // ─────────────────────────────────────────────
  // Finders
  // ─────────────────────────────────────────────

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { phoneNumber },
      relations: ['terms'],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['terms'],
    });
  }

  // ─────────────────────────────────────────────
  // Commands
  // ─────────────────────────────────────────────

  async create(data: {
    name: string;
    phoneNumber: string;
    email?: string;
    password: string;
    role: Role;
    terms: {
      serviceAgreed: boolean;
      privacyAgreed: boolean;
      marketingAgreed: boolean;
    };
  }): Promise<User> {
    const existing = await this.findByPhoneNumber(data.phoneNumber);
    if (existing) {
      throw new ConflictException({
        code: 'PHONE_ALREADY_EXISTS',
        message: '이미 가입된 휴대폰 번호입니다.',
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const referralCode = await this.generateReferralCode();

    const user = this.userRepository.create({
      name: data.name,
      phoneNumber: data.phoneNumber,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      referralCode,
      terms: {
        serviceAgreed: data.terms.serviceAgreed,
        privacyAgreed: data.terms.privacyAgreed,
        marketingAgreed: data.terms.marketingAgreed,
      },
    });

    return this.userRepository.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    if (dto.phoneNumber && dto.phoneNumber !== user.phoneNumber) {
      const dup = await this.findByPhoneNumber(dto.phoneNumber);
      if (dup) {
        throw new ConflictException({
          code: 'PHONE_ALREADY_EXISTS',
          message: '이미 사용 중인 휴대폰 번호입니다.',
        });
      }
      user.phoneNumber = dto.phoneNumber;
    }

    if (dto.name) user.name = dto.name;
    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }
    
    if (dto.marketingAgreed !== undefined && user.terms) {
      user.terms.marketingAgreed = dto.marketingAgreed;
    }

    return this.userRepository.save(user);
  }

  async updatePasswordByPhone(
    phoneNumber: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findByPhoneNumber(phoneNumber);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: '사용자를 찾을 수 없습니다.',
      });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
  }

  async validatePassword(user: User, plain: string): Promise<boolean> {
    return bcrypt.compare(plain, user.password);
  }
}
