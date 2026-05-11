import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BusinessVerifyRequest,
  BusinessVerifyResult,
  IBusinessVerifyService,
} from './interfaces/business-verify.interface';

/**
 * 공공데이터포털 국세청 사업자 등록번호 진위 확인 API 클라이언트
 * @see https://www.data.go.kr/data/15081808/openapi.do
 */
@Injectable()
export class PublicDataService implements IBusinessVerifyService {
  private readonly logger = new Logger(PublicDataService.name);
  private readonly apiKey: string;
  private readonly apiUrl =
    'https://api.odcloud.kr/api/nts-businessman/v1/status';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('PUBLIC_DATA_API_KEY', '');
  }

  async verify(request: BusinessVerifyRequest): Promise<BusinessVerifyResult> {
    if (!this.apiKey) {
      this.logger.warn('PUBLIC_DATA_API_KEY가 설정되지 않아 Mock 응답을 반환합니다.');
      return { valid: true, status: '계속사업자 (Mock)' };
    }

    try {
      const res = await fetch(
        `${this.apiUrl}?serviceKey=${encodeURIComponent(this.apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            b_no: [request.businessNumber],
          }),
        },
      );

      if (!res.ok) {
        throw new Error(`Public API HTTP Error: ${res.status}`);
      }

      const json = (await res.json()) as {
        data?: { b_stt?: string; tax_type?: string }[];
      };
      const item = json?.data?.[0];

      if (!item || !item.tax_type) return { valid: false, status: '조회 실패 (응답 데이터 없음)' };

      // 국세청 응답 메시지는 때에 따라 미묘하게 달라질 수 있으므로, '등록되지 않은' 이라는 키워드로 검사합니다.
      const isUnregistered = item.tax_type.includes('등록되지 않은');
      
      // b_stt 값이 빈 문자열이면 tax_type을 사용하고, 둘 다 없으면 '알 수 없음' 반환
      const statusStr = item.b_stt || item.tax_type || '알 수 없음';
      
      const valid = !isUnregistered && !!item.b_stt;

      return {
        valid,
        status: statusStr,
      };
    } catch (err) {
      this.logger.error('사업자 번호 진위 확인 API 오류', err);
      throw err;
    }
  }
}
