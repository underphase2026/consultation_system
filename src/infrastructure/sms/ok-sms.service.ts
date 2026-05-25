import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface SendSmsParams {
  to: string;
  message: string;
}

@Injectable()
export class OkSmsService {
  private readonly logger = new Logger(OkSmsService.name);
  private readonly userId: string;
  private readonly userPass: string;
  private readonly sender: string;
  private readonly endpoints = {
    SMS: 'https://www.okmunja.co.kr/Remote/RemoteSms.html',
    LMS: 'https://www.okmunja.co.kr/Remote/RemoteMms.html',
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.userId = this.configService.get<string>('OKMUNJA_ID', '');
    this.userPass = this.configService.get<string>('OKMUNJA_PASS', '');
    this.sender = this.configService.get<string>('SENDER_NUMBER', '')?.replace(/[^0-9]/g, '');
  }

  /**
   * 메시지 길이에 따라 SMS/LMS 엔드포인트 결정
   */
  private getEndpoint(message: string): string {
    const byteLength = Buffer.byteLength(message, 'euc-kr' as BufferEncoding);
    return byteLength > 90 ? this.endpoints.LMS : this.endpoints.SMS;
  }

  async send(params: SendSmsParams): Promise<{ success: boolean; message: string }> {
    // ok문자 API 키가 없으면 Mock 모드 (개발/테스트 환경)
    if (!this.userId || !this.userPass) {
      this.logger.warn(`[Mock SMS] TO: ${params.to} | MSG: ${params.message}`);
      return { success: true, message: 'Mock 발송 완료' };
    }

    const endpoint = this.getEndpoint(params.message);
    const receiver = params.to.replace(/[^0-9]/g, '');

    const formParams = new URLSearchParams();
    formParams.append('remote_id', this.userId);
    formParams.append('remote_pass', this.userPass);
    formParams.append('remote_num', '1');
    formParams.append('remote_phone', receiver);
    formParams.append('remote_callback', this.sender);
    formParams.append('remote_msg', params.message);

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(endpoint, formParams, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          responseType: 'text',
        }),
      );

      return this.parseResponse(data, params.to);
    } catch (error: any) {
      this.logger.error(`[OkSmsService Network Error]: ${error.message}`);
      throw new InternalServerErrorException({
        code: 'SMS_SEND_FAILED',
        message: '네트워크 연결 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        details: error.message,
      });
    }
  }

  private parseResponse(data: string, to: string) {
    if (!data || typeof data !== 'string') {
      throw new InternalServerErrorException('응답 데이터 형식이 올바르지 않습니다.');
    }

    const parts = data.split('|');
    const result: Record<string, string> = {};
    parts.forEach((part) => {
      const [key, value] = part.split('=');
      if (key) result[key.trim()] = value ? value.trim() : '';
    });

    const code = result.code;
    const message = result.msg || '알 수 없는 응답';

    if (code === '0000') {
      this.logger.log(`SMS 발송 성공 → ${to}`);
      return { success: true, message: '인증번호가 발송되었습니다.' };
    }

    this.logger.error(`ok문자 API 실패: ${data}`);
    throw new InternalServerErrorException({
      code: 'SMS_SEND_FAILED',
      message: 'SMS 발송에 실패했습니다. (API 오류)',
      details: message,
    });
  }
}
