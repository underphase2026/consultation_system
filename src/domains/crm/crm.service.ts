import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmCustomer, CrmCustomerStatus } from './entities/crm-customer.entity';
import { StoresService } from '../stores/stores.service';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);

  constructor(
    @InjectRepository(CrmCustomer)
    private readonly crmCustomerRepository: Repository<CrmCustomer>,
    private readonly storesService: StoresService,
  ) {}

  // 리스너 1 로직: 견적 생성 시 CRM 고객 생성/상태 변경
  async processQuoteCreated(payload: any) {
    const quote = payload.quote || payload;
    if (!quote || !quote.id) {
      this.logger.warn('Invalid quote created event payload');
      return;
    }

    // 데모: 견적에는 핸드폰번호가 아직 없을 수 있음. 전화번호가 없으면 가상 고객 생성
    const phone = quote.customerPhone || `TBD-${Date.now()}`;
    const storeId = quote.storeId || null;

    let customer = await this.crmCustomerRepository.findOne({ where: { phone } });
    if (!customer) {
      customer = this.crmCustomerRepository.create({
        phone,
        storeId,
        status: CrmCustomerStatus.CONSULTING,
        metadata: { latestQuoteId: quote.id },
      });
    } else {
      customer.status = CrmCustomerStatus.CONSULTING;
      customer.metadata = { ...customer.metadata, latestQuoteId: quote.id };
    }

    await this.crmCustomerRepository.save(customer);
  }

  // 리스너 2 로직: 서드파티 계약 서명 시 CRM 고객 상태 변경
  async processContractSigned(payload: any) {
    // payload: { contractId, quoteId, documentId, signedAt, phone? }
    // 서드파티 웹훅에서 phone이 오지 않을 경우, 아까 quoteId로 저장한 메타데이터 혹은 다른 식별자로 찾아야 함.
    // 데모 로직: 메타데이터에서 latestQuoteId로 고객을 찾음. PostgreSQL/TypeORM jsonb 필터링이 어려우면 임시로 find 후 메모리 필터 처리.
    
    // 이 예제에서는 단순하게 가장 최근 고객을 가져오거나 metadata 검색을 가정함.
    // (실무에서는 crm_customer에 quoteId 컬럼을 두거나, jsonb-path 쿼리를 사용)
    const quoteId = payload.quoteId;
    if (!quoteId) return;

    // TypeORM에서 JSONB 조회가 까다로우므로 전체를 찾아서(가정) 메모리상으로 필터링하는 데모 코드
    // 성능상 문제가 있으므로 실무라면 CrmCustomer에 quoteId 인덱스를 추가해야 함.
    const customers = await this.crmCustomerRepository.find();
    let customer = customers.find(c => c.metadata && c.metadata.latestQuoteId === quoteId);

    if (!customer) {
      customer = this.crmCustomerRepository.create({
        phone: `SIGNED-${Date.now()}`,
        metadata: { latestQuoteId: quoteId },
      });
    }

    customer.status = CrmCustomerStatus.CONTRACT_COMPLETED;
    customer.lastContractDate = payload.signedAt ? new Date(payload.signedAt) : new Date();
    customer.metadata = { ...customer.metadata, latestContractId: payload.contractId };

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
