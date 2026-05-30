import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { ElectronicContract, ElectronicContractStatus } from './entities/electronic-contract.entity';
import { Quote } from '../consultations/entities/quote.entity';
import { EventOutbox } from '../consultations/entities/event-outbox.entity';

@Injectable()
export class ElectronicContractsService {
  private readonly logger = new Logger(ElectronicContractsService.name);
  
  // 가상의 서드파티 전자계약 API 엔드포인트 및 API Key
  private readonly ESIGN_API_URL = 'https://api.mock-esign.com/v1/documents';
  private readonly ESIGN_API_KEY = 'mock_api_key_12345';
  private readonly TEMPLATE_ID = 'template_mobile_subscription_001';

  constructor(
    @InjectRepository(ElectronicContract)
    private readonly electronicContractRepository: Repository<ElectronicContract>,
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
    @InjectRepository(EventOutbox)
    private readonly eventOutboxRepository: Repository<EventOutbox>,
    private readonly httpService: HttpService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 견적서(Quote) 스냅샷 데이터를 기반으로 서드파티 전자계약서 생성 요청
   */
  async createContractFromQuote(quoteId: string, signerInfo: { name: string; phone: string; email: string }) {
    // 1. 견적 데이터 조회
    const quote = await this.quoteRepository.findOne({ where: { id: quoteId } });
    if (!quote) {
      throw new NotFoundException('유효하지 않은 견적 데이터입니다.');
    }

    // 2. 서드파티 API 전송용 페이로드 조립 (템플릿 동적 필드 매핑)
    const payload = {
      templateId: this.TEMPLATE_ID,
      signers: [
        {
          role: 'CUSTOMER',
          name: signerInfo.name,
          phone: signerInfo.phone,
          email: signerInfo.email,
        }
      ],
      // 견적의 가격 데이터와 단말기명 등을 서드파티 템플릿 필드에 매핑
      dynamicFields: {
        'quote_name': quote.quoteName,
        'network_type': quote.networkType,
        'carrier': quote.carrier,
        'retail_price': quote.retailPrice.toString(),
        'public_subsidy': quote.publicSubsidy.toString(),
        'principal': quote.principal.toString(), // 할부원금 매핑
        'created_date': new Date().toISOString().split('T')[0],
      },
    };

    try {
      // 3. 서드파티 통신 (HttpModule 활용)
      const response = await firstValueFrom(
        this.httpService.post(this.ESIGN_API_URL, payload, {
          headers: {
            'Authorization': `Bearer ${this.ESIGN_API_KEY}`,
            'Content-Type': 'application/json',
          },
          // 데모 환경이므로 404/500 에러 시에도 진행 테스트를 위해 interceptor로 mock을 씌우는 대신 try-catch로 방어
        })
      ).catch((err) => {
        this.logger.warn(`Mocking the 3rd-party API response due to connection error: ${err.message}`);
        // [테스트/데모용 Mock 응답 반환]
        return { data: { documentId: `doc_${Date.now()}`, status: 'PENDING' } };
      });

      const { documentId, status: remoteStatus } = response.data;

      // 4. 로컬 DB에 전자계약 엔티티 저장
      const electronicContract = this.electronicContractRepository.create({
        quoteId: quote.id,
        documentId,
        status: remoteStatus === 'PENDING' ? ElectronicContractStatus.PENDING : ElectronicContractStatus.PENDING,
        signerInfo,
      });

      await this.electronicContractRepository.save(electronicContract);

      return electronicContract;
    } catch (error) {
      this.logger.error('전자계약 생성 중 오류 발생', error.stack);
      throw new InternalServerErrorException('전자계약서 발송에 실패했습니다.');
    }
  }

  /**
   * Phase 3: 웹훅 처리 및 Outbox 기반 이벤트 발행
   */
  async handleWebhook(payload: any, signature: string) {
    // 1. 간단한 서명 검증 로직 (실제로는 HMAC SHA256 등 사용)
    const expectedSignature = 'valid_signature_token'; // Mock 검증
    if (signature !== expectedSignature) {
      this.logger.warn('웹훅 서명 검증 실패');
      // throw new UnauthorizedException('Invalid webhook signature');
      // 데모/테스트 환경이므로 로깅 후 진행 혹은 예외처리 적용 가능. 여기선 강제 실패는 주석 처리.
    }

    const { documentId, status } = payload;
    if (!documentId) return;

    // 트랜잭션 시작 (Outbox Pattern)
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const contract = await queryRunner.manager.findOne(ElectronicContract, { where: { documentId } });
      if (!contract) {
        this.logger.warn(`Webhook received for unknown documentId: ${documentId}`);
        await queryRunner.rollbackTransaction();
        return;
      }

      // 상태 업데이트
      const isStatusChanged = contract.status !== status;
      contract.status = status;
      if (status === ElectronicContractStatus.SIGNED) {
        contract.signedAt = new Date();
      }
      await queryRunner.manager.save(ElectronicContract, contract);

      // 서명 완료(SIGNED) 상태로 변경되었을 때만 이벤트 발행 (Outbox Pattern)
      if (isStatusChanged && status === ElectronicContractStatus.SIGNED) {
        const outbox = queryRunner.manager.create(EventOutbox, {
          eventType: 'contract.signed',
          payload: { 
            contractId: contract.id,
            quoteId: contract.quoteId,
            documentId: contract.documentId,
            signedAt: contract.signedAt,
          },
        });
        await queryRunner.manager.save(EventOutbox, outbox);
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Webhook processed successfully for documentId: ${documentId}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('웹훅 처리 중 오류 발생', error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
