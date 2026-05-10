import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { User } from './interfaces/user.interface';
import { Role } from '../../common/enums/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  /** 인메모리 저장소 (추후 TypeORM Repository로 교체) */
  private readonly store = new Map<string, User>();

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────

  /** 영문 대소문자 6자리 추천인 코드 생성 (중복 체크 포함) */
  generateReferralCode(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let code: string;
    do {
      code = Array.from({ length: 6 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length)),
      ).join('');
    } while (this.isReferralCodeUsed(code));
    return code;
  }

  private isReferralCodeUsed(code: string): boolean {
    for (const user of this.store.values()) {
      if (user.referralCode === code) return true;
    }
    return false;
  }

  // ─────────────────────────────────────────────
  // Finders
  // ─────────────────────────────────────────────

  async findByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    for (const user of this.store.values()) {
      if (user.phoneNumber === phoneNumber) return user;
    }
    return undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    return this.store.get(id);
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
    marketingAgreed: boolean;
  }): Promise<User> {
    const existing = await this.findByPhoneNumber(data.phoneNumber);
    if (existing) {
      throw new ConflictException({
        code: 'PHONE_ALREADY_EXISTS',
        message: '이미 가입된 휴대폰 번호입니다.',
      });
    }

    const user: User = {
      id: uuidv4(),
      name: data.name,
      phoneNumber: data.phoneNumber,
      email: data.email,
      password: await bcrypt.hash(data.password, 10),
      role: data.role,
      referralCode: this.generateReferralCode(),
      marketingAgreed: data.marketingAgreed,
      createdAt: new Date(),
    };

    this.store.set(user.id, user);
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = this.store.get(id);
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
    }

    const updated: User = {
      ...user,
      name: dto.name ?? user.name,
      phoneNumber: dto.phoneNumber ?? user.phoneNumber,
      password: dto.password
        ? await bcrypt.hash(dto.password, 10)
        : user.password,
      marketingAgreed: dto.marketingAgreed ?? user.marketingAgreed,
    };

    this.store.set(id, updated);
    return updated;
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
    this.store.set(user.id, user);
  }

  async validatePassword(user: User, plain: string): Promise<boolean> {
    return bcrypt.compare(plain, user.password);
  }
}
