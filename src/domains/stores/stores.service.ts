import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { StoreStaff } from './entities/store-staff.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { JoinStoreDto } from './dto/join-store.dto';
import { UsersService } from '../users/users.service';
import { Role } from '../../common/enums/role.enum';
import { BUSINESS_VERIFY_SERVICE } from '../../infrastructure/public-data/interfaces/business-verify.interface';
import type { IBusinessVerifyService } from '../../infrastructure/public-data/interfaces/business-verify.interface';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(StoreStaff)
    private readonly storeStaffRepository: Repository<StoreStaff>,
    private readonly usersService: UsersService,
    @Inject(BUSINESS_VERIFY_SERVICE)
    private readonly businessVerifyService: IBusinessVerifyService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // ─────────────────────────────────────────────
  // S1. 내 매장 조회
  // ─────────────────────────────────────────────
  async getMyStores(userId: string, role: Role) {
    if (role === Role.OWNER) {
      const stores = await this.storeRepository.find({
        where: { ownerId: userId },
        relations: ['owner'],
      });
      return stores.map((s) => ({
        storeId: s.id,
        storeName: s.storeName,
        address: s.detailedAddress,
        rate: s.rate ?? null,
        ownerName: s.owner?.name ?? '',
        phoneNumber: s.storePhone ?? s.owner?.phoneNumber ?? '',
      }));
    }

    // STAFF: 소속 매장 반환
    const staffs = await this.storeStaffRepository.find({
      where: { userId },
      relations: ['store', 'store.owner'],
    });

    return staffs.map((st) => {
      const s = st.store;
      return {
        storeId: s.id,
        storeName: s.storeName,
        address: s.detailedAddress,
        rate: s.rate ?? null,
        ownerName: s.owner?.name ?? '',
        phoneNumber: s.storePhone ?? s.owner?.phoneNumber ?? '',
      };
    });
  }

  // ─────────────────────────────────────────────
  // S2. 매장 등록 (OWNER 전용)
  // ─────────────────────────────────────────────
  async createStore(ownerId: string, dto: CreateStoreDto) {
    const existing = await this.storeRepository.findOne({
      where: { businessRegistrationNumber: dto.businessRegistrationNumber },
    });

    if (existing) {
      throw new ConflictException({
        code: 'BUSINESS_NUMBER_ALREADY_EXISTS',
        message: '이미 등록된 사업자 등록번호입니다.',
      });
    }

    const verifyResult = await this.businessVerifyService.verify({
      businessNumber: dto.businessRegistrationNumber,
      representativeName: '',
      openDate: '',
    });

    if (!verifyResult.valid) {
      throw new BadRequestException({
        code: 'INVALID_BUSINESS_NUMBER',
        message: `사업자 번호 확인 실패: ${verifyResult.status}`,
      });
    }

    const storeCode = await this.generateStoreCode();

    const newStore = this.storeRepository.create({
      ownerId,
      storeBusinessName: dto.storeBusinessName,
      storeName: dto.storeName,
      businessRegistrationNumber: dto.businessRegistrationNumber,
      postcode: dto.postcode,
      roadAddress: dto.roadAddress,
      jibunAddress: dto.jibunAddress,
      detailedAddress: dto.detailedAddress,
      lat: dto.lat,
      lng: dto.lng,
      storePhone: dto.storePhonenumber, // DTO 이름과 Entity 필드명이 다름에 주의 (storePhonenumber -> storePhone)
      storeCode,
    });

    await this.storeRepository.save(newStore);

    return {
      storeId: newStore.id,
      storeName: newStore.storeName,
      storeCode: newStore.storeCode,
    };
  }

  // ─────────────────────────────────────────────
  // S2-1. 사업자 등록번호 진위 확인 API (프론트엔드 사전 검증용)
  // ─────────────────────────────────────────────
  async verifyBusinessNumber(businessNumber: string) {
    const verifyResult = await this.businessVerifyService.verify({
      businessNumber,
      representativeName: '',
      openDate: '',
    });

    if (!verifyResult.valid) {
      throw new BadRequestException({
        code: 'INVALID_BUSINESS_NUMBER',
        message: `사업자 번호 확인 실패: ${verifyResult.status}`,
      });
    }

    return {
      valid: true,
      status: verifyResult.status,
    };
  }

  // ─────────────────────────────────────────────
  // S2-2. 카카오 로컬 API를 통한 주소 검색 및 좌표 변환
  // ─────────────────────────────────────────────
  async geocodeAddress(address: string) {
    const kakaoApiKey = this.configService.get<string>('KAKAO_REST_API_KEY');
    if (!kakaoApiKey) {
      throw new InternalServerErrorException('카카오 API 키가 설정되지 않았습니다.');
    }

    try {
      const url = `https://dapi.kakao.com/v2/local/search/address.json`;
      const response = await lastValueFrom(
        this.httpService.get(url, {
          params: { query: address },
          headers: {
            Authorization: `KakaoAK ${kakaoApiKey}`,
          },
        })
      );

      const data = response.data;
      if (!data || !data.documents || data.documents.length === 0) {
        throw new NotFoundException('검색된 주소 결과가 없습니다.');
      }

      const firstResult = data.documents[0];
      return {
        addressName: firstResult.address_name,
        roadAddress: firstResult.road_address?.address_name || null,
        jibunAddress: firstResult.address?.address_name || null,
        lat: parseFloat(firstResult.y),
        lng: parseFloat(firstResult.x),
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('주소 변환 중 서버 오류가 발생했습니다.');
    }
  }

  // ─────────────────────────────────────────────
  // S3. 매장 합류 (STAFF 전용)
  // ─────────────────────────────────────────────
  async joinStore(staffId: string, dto: JoinStoreDto) {
    // 특정 매장에 이미 합류했는지 확인 (현재는 직원이 1개의 매장에만 속한다고 가정하지만 N:M 대비로 구조화)
    const existing = await this.storeStaffRepository.findOne({
      where: { userId: staffId },
    });

    if (existing) {
      throw new ConflictException({
        code: 'ALREADY_JOINED',
        message: '이미 매장에 소속되어 있습니다.',
      });
    }

    const target = await this.storeRepository.findOne({
      where: { storeCode: dto.storeCode },
    });

    if (!target) {
      throw new NotFoundException({
        code: 'STORE_NOT_FOUND',
        message: '유효하지 않은 매장 코드입니다.',
      });
    }

    const storeStaff = this.storeStaffRepository.create({
      userId: staffId,
      storeId: target.id,
    });

    await this.storeStaffRepository.save(storeStaff);

    return { storeId: target.id, storeName: target.storeName };
  }

  // ─────────────────────────────────────────────
  // Helper
  // ─────────────────────────────────────────────
  private async generateStoreCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let isUsed = true;
    while (isUsed) {
      code = Array.from({ length: 8 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length)),
      ).join('');
      const count = await this.storeRepository.count({ where: { storeCode: code } });
      isUsed = count > 0;
    }
    return code;
  }
}
