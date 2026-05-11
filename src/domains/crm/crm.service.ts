import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { CrmCustomer } from './entities/crm-customer.entity';
import { ContractCompletedEvent } from '../contracts/events/contract-completed.event';
import { StoresService } from '../stores/stores.service';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class CrmService {
  constructor(
    @InjectRepository(CrmCustomer)
    private readonly crmCustomerRepository: Repository<CrmCustomer>,
    private readonly storesService: StoresService,
  ) {}

  @OnEvent('contract.esign.completed')
  async handleContractCompleted(event: ContractCompletedEvent) {
    const { storeId, customerName, customerPhone, signedAt } = event;

    // 매장 내 고객 전화번호 기준 중복 확인
    let customer = await this.crmCustomerRepository.findOne({
      where: { storeId, phone: customerPhone },
    });

    if (customer) {
      // 기존 고객이면 최종 계약일만 업데이트
      customer.lastContractDate = signedAt;
      if (customer.name !== customerName) {
        customer.name = customerName; // 이름이 바뀌었으면 업데이트
      }
    } else {
      // 신규 고객이면 생성
      customer = this.crmCustomerRepository.create({
        storeId,
        name: customerName,
        phone: customerPhone,
        lastContractDate: signedAt,
      });
    }

    await this.crmCustomerRepository.save(customer);
  }

  async getCustomersByStore(userId: string, role: Role, storeId: string) {
    const myStores = await this.storesService.getMyStores(userId, role);
    const hasAccess = myStores.some((s) => s.storeId === storeId);
    
    if (!hasAccess) {
      throw new ForbiddenException({
        code: 'STORE_ACCESS_DENIED',
        message: '해당 매장의 고객 정보에 접근할 권한이 없습니다.',
      });
    }

    return this.crmCustomerRepository.find({
      where: { storeId },
      order: { lastContractDate: 'DESC' },
    });
  }
}
