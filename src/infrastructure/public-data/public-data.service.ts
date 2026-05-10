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
            businesses: [
              {
                b_no: request.businessNumber,
                p_nm: request.representativeName,
                start_dt: request.openDate,
              },
            ],
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

      if (!item) return { valid: false, status: '조회 실패' };

      const valid =
        item.tax_type !== '국세청에 등록되지 않은 사업자입니다.';
      return {
        valid,
        status: item.b_stt ?? item.tax_type ?? '알 수 없음',
      };
    } catch (err) {
      this.logger.error('사업자 번호 진위 확인 API 오류', err);
      throw err;
    }
  }
}
