import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { Contract } from './entities/contract.entity';
import { ContractStatus } from './enums/contract-status.enum';
import { CreateContractDto } from './dto/contract.dto';
import { CreateElectronicContractDto } from './dto/create-electronic-contract.dto';
import { ContractCompletedEvent } from './events/contract-completed.event';
import { StoresService } from '../stores/stores.service';
import { Quote } from '../consultations/entities/quote.entity';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
    private readonly storesService: StoresService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createContract(userId: string, role: Role, dto: CreateContractDto) {
    // 매장 권한 검증 (본인이 소속된 매장인지)
    const myStores = await this.storesService.getMyStores(userId, role);
    const hasAccess = myStores.some((s) => s.storeId === dto.storeId);
    
    if (!hasAccess) {
      throw new ForbiddenException({
        code: 'STORE_ACCESS_DENIED',
        message: '해당 매장에 대한 권한이 없습니다.',
      });
    }

    const electronicContractId = uuidv4(); // 가상의 전자계약서 외부 ID 발급

    const contract = this.contractRepository.create({
      storeId: dto.storeId,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      status: ContractStatus.E_SIGN_PENDING,
      electronicContractId,
    });

    await this.contractRepository.save(contract);

    return {
      contractId: contract.id,
      status: contract.status,
      electronicContractId: contract.electronicContractId,
    };
  }

  async completeSignature(contractId: string) {
    const contract = await this.contractRepository.findOne({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException({
        code: 'CONTRACT_NOT_FOUND',
        message: '계약서를 찾을 수 없습니다.',
      });
    }

    if (contract.status === ContractStatus.COMPLETED) {
      return { message: '이미 완료된 계약서입니다.' };
    }

    contract.status = ContractStatus.COMPLETED;
    contract.signedAt = new Date();
    await this.contractRepository.save(contract);

    // [핵심] 서명 완료 이벤트 발행 (CRM 모듈에서 수신)
    const event = new ContractCompletedEvent();
    event.contractId = contract.id;
    event.storeId = contract.storeId;
    event.customerName = contract.customerName;
    event.customerPhone = contract.customerPhone;
    event.signedAt = contract.signedAt;
    
    this.eventEmitter.emit('contract.esign.completed', event);

    return { message: '전자서명이 완료되었습니다.' };
  }

  // Phase 3: 전자계약 우선 매칭 준비 로직
  async prepareElectronicContract(userId: string, role: Role, dto: CreateElectronicContractDto) {
    const { quoteId, customerName, customerPhone, storeId } = dto;

    // 1. 견적(Quote) 존재 여부 및 스냅샷 검증
    const quote = await this.quoteRepository.findOne({ where: { id: quoteId } });
    if (!quote) {
      throw new NotFoundException({
        code: 'QUOTE_NOT_FOUND',
        message: '유효하지 않은 견적 데이터입니다.',
      });
    }

    // 2. 권한 검증 (매장) - 초기 형태이므로 storeId가 있다면 검증
    if (storeId) {
      const myStores = await this.storesService.getMyStores(userId, role);
      const hasAccess = myStores.some((s) => s.storeId === storeId);
      
      if (!hasAccess) {
        throw new ForbiddenException({
          code: 'STORE_ACCESS_DENIED',
          message: '해당 매장에 대한 권한이 없습니다.',
        });
      }
    }

    // 3. 전자서명 템플릿 매핑을 위한 외부 ID 발급 및 계약서 생성 (스냅샷 연결)
    const electronicContractId = uuidv4();

    const contract = this.contractRepository.create({
      storeId: storeId || 'TEMP_STORE', // 실제 구현 시 맵핑 필요
      customerName,
      customerPhone,
      status: ContractStatus.E_SIGN_PENDING,
      electronicContractId,
    });

    await this.contractRepository.save(contract);

    // 4. 추후 이벤트 발송 등 연동을 위해 Quote에도 Contract ID 업데이트 가능(옵션)
    // quote.contractId = contract.id;
    // await this.quoteRepository.save(quote);

    return {
      message: '전자계약 템플릿 매핑 및 준비 완료',
      contractId: contract.id,
      electronicContractId,
      quoteId: quote.id,
      snapshot: {
        retailPrice: quote.retailPrice,
        publicSubsidy: quote.publicSubsidy,
        principal: quote.principal,
      },
      status: contract.status,
    };
  }
}
