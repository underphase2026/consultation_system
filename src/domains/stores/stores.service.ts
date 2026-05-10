import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Store } from './interfaces/store.interface';
import { CreateStoreDto } from './dto/create-store.dto';
import { JoinStoreDto } from './dto/join-store.dto';
import { UsersService } from '../users/users.service';
import { Role } from '../../common/enums/role.enum';
import { BUSINESS_VERIFY_SERVICE } from '../../infrastructure/public-data/interfaces/business-verify.interface';
import type { IBusinessVerifyService } from '../../infrastructure/public-data/interfaces/business-verify.interface';

@Injectable()
export class StoresService {
  /** 인메모리 저장소 (추후 TypeORM Repository로 교체) */
  private readonly store = new Map<string, Store>();

  /** staffId → storeId 역방향 인덱스 */
  private readonly staffStoreIndex = new Map<string, string>();

  constructor(
    private readonly usersService: UsersService,
    @Inject(BUSINESS_VERIFY_SERVICE)
    private readonly businessVerifyService: IBusinessVerifyService,
  ) {}

  // ─────────────────────────────────────────────
  // S1. 내 매장 조회
  // ─────────────────────────────────────────────
  async getMyStores(userId: string, role: Role) {
    if (role === Role.OWNER) {
      const ownerStores = [...this.store.values()].filter(
        (s) => s.ownerId === userId,
      );
      return this.formatStores(ownerStores, userId);
    }

    // STAFF: 소속 매장 단일 반환
    const storeId = this.staffStoreIndex.get(userId);
    if (!storeId) return [];
    const staffStore = this.store.get(storeId);
    if (!staffStore) return [];
    return this.formatStores([staffStore], staffStore.ownerId);
  }

  private async formatStores(stores: Store[], ownerId: string) {
    const owner = await this.usersService.findById(ownerId);
    return stores.map((s) => ({
      storeId: s.id,
      storeName: s.storeName,
      address: s.detailedAddress,
      rate: s.rate ?? null,
      ownerName: owner?.name ?? '',
      phoneNumber: s.storePhonenumber ?? owner?.phoneNumber ?? '',
    }));
  }

  // ─────────────────────────────────────────────
  // S2. 매장 등록 (OWNER 전용)
  // ─────────────────────────────────────────────
  async createStore(ownerId: string, dto: CreateStoreDto) {
    // 사업자 번호 중복 체크
    for (const s of this.store.values()) {
      if (s.businessRegistrationNumber === dto.businessRegistrationNumber) {
        throw new ConflictException({
          code: 'BUSINESS_NUMBER_ALREADY_EXISTS',
          message: '이미 등록된 사업자 등록번호입니다.',
        });
      }
    }

    // 사업자 번호 진위 확인 (인프라 레이어 DI)
    const verifyResult = await this.businessVerifyService.verify({
      businessNumber: dto.businessRegistrationNumber,
      representativeName: '', // 추후 OWNER 이름 연동
      openDate: '',           // 추후 입력 필드 추가
    });

    if (!verifyResult.valid) {
      throw new BadRequestException({
        code: 'INVALID_BUSINESS_NUMBER',
        message: `사업자 번호 확인 실패: ${verifyResult.status}`,
      });
    }

    const newStore: Store = {
      id: uuidv4(),
      ownerId,
      storeBusinessName: dto.storeBusinessName,
      storeName: dto.storeName,
      businessRegistrationNumber: dto.businessRegistrationNumber,
      postcode: dto.postcode,
      detailedAddress: dto.detailedAddress,
      storePhonenumber: dto.storePhonenumber,
      storeCode: this.generateStoreCode(),
      staffIds: [],
      createdAt: new Date(),
    };

    this.store.set(newStore.id, newStore);

    return {
      storeId: newStore.id,
      storeName: newStore.storeName,
      storeCode: newStore.storeCode,
    };
  }

  // ─────────────────────────────────────────────
  // S3. 매장 합류 (STAFF 전용)
  // ─────────────────────────────────────────────
  async joinStore(staffId: string, dto: JoinStoreDto) {
    // 이미 매장 소속 여부 확인
    if (this.staffStoreIndex.has(staffId)) {
      throw new ConflictException({
        code: 'ALREADY_JOINED',
        message: '이미 매장에 소속되어 있습니다.',
      });
    }

    const target = [...this.store.values()].find(
      (s) => s.storeCode === dto.storeCode,
    );
    if (!target) {
      throw new NotFoundException({
        code: 'STORE_NOT_FOUND',
        message: '유효하지 않은 매장 코드입니다.',
      });
    }

    target.staffIds.push(staffId);
    this.store.set(target.id, target);
    this.staffStoreIndex.set(staffId, target.id);

    return { storeId: target.id, storeName: target.storeName };
  }

  // ─────────────────────────────────────────────
  // Helper
  // ─────────────────────────────────────────────
  private generateStoreCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    do {
      code = Array.from({ length: 8 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length)),
      ).join('');
    } while ([...this.store.values()].some((s) => s.storeCode === code));
    return code;
  }
}
