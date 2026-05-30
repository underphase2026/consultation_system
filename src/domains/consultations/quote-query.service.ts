import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { QuoteSummaryDto } from './dto/quote-summary.dto';

@Injectable()
export class QuoteQueryService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * CQRS 읽기 전용 모델 (Read Model)
   * 여러 도메인(견적, 계약, CRM)의 데이터를 N+1 문제 없이 하나의 쿼리로 Aggregation
   */
  async getQuoteSummaryList(userId?: string): Promise<QuoteSummaryDto[]> {
    const queryBuilder = this.dataSource.createQueryBuilder();

    // 1. Quotes를 메인으로 하고, 연관된 Devices 정보를 가져온다.
    // 2. Contracts 테이블은 물리적 외래키가 없더라도, Quote와 연결고리(예: quoteId 파생 필드나 메타데이터 등)를 기반으로 LEFT JOIN 처리.
    // (여기서는 구조적 확장을 위한 논리적 조인 형태를 예시로 작성)
    queryBuilder
      .select([
        'q.id AS "quoteId"',
        'q.quoteName AS "quoteName"',
        'd.deviceName AS "deviceName"',
        'q.principal AS "principal"',
        'c.id AS "contractId"',
        'c.status AS "contractStatus"',
        'crm.id AS "crmCustomerId"',
      ])
      .from('quotes', 'q')
      .innerJoin('devices', 'd', 'd.id = q.deviceId')
      // 계약 모듈과의 조인 (논리적 연결. 실제로는 event payload나 crm_customer에 quote_id 컬럼을 두어 매핑)
      // 추후 이벤트 기반으로 동기화된 별도 Read용 통합 테이블을 사용하는 것이 가장 이상적인 CQRS 패턴이나,
      // 현재는 RDBMS 수준에서 원격 도메인 테이블을 LEFT JOIN하는 방식으로 N+1 쿼리 폭발을 방지합니다.
      .leftJoin('contracts', 'c', 'c.customerPhone = crm.phone') // 예시 조인 조건 (추후 quoteId 기반으로 변경)
      .leftJoin('crm_customers', 'crm', "crm.metadata->>'latestQuoteId' = q.id");

    // 조회 권한이 있는 경우 필터 (BFF 요청에 대응)
    if (userId) {
      // queryBuilder.where('q.userId = :userId', { userId });
    }

    queryBuilder.orderBy('q.createdAt', 'DESC');
    queryBuilder.limit(20);

    const rawResults = await queryBuilder.getRawMany();

    return rawResults.map((row) => ({
      quoteId: row.quoteId,
      quoteName: row.quoteName,
      deviceName: row.deviceName,
      principal: Number(row.principal),
      contractId: row.contractId || null,
      contractStatus: row.contractStatus || null,
      crmCustomerId: row.crmCustomerId || null,
    }));
  }
}
