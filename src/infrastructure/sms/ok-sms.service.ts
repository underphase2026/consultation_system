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
  private readonly apiKey: string;
  private readonly sender: string;
  private readonly apiUrl = 'https://api.ok-sms.com/send';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.userId = this.configService.get<string>('OKSMS_USER_ID', '');
    this.apiKey = this.configService.get<string>('OKSMS_API_KEY', '');
    this.sender = this.configService.get<string>('OKSMS_SENDER', '');
  }

  async send(params: SendSmsParams): Promise<void> {
    // ok문자 API 키가 없으면 Mock 모드 (개발/테스트 환경)
    if (!this.userId || !this.apiKey) {
      this.logger.warn(
        `[Mock SMS] TO: ${params.to} | MSG: ${params.message}`,
      );
      return;
    }

    try {
      const payload = {
        userid: this.userId,
        apikey: this.apiKey,
        sender: this.sender,
        receiver: params.to,
        msg: params.message,
        msg_type: 'SMS', // SMS(단문), LMS(장문)
      };

      const { data } = await firstValueFrom(
        this.httpService.post(this.apiUrl, payload, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      // ok문자 성공 응답 코드: "1"
      if (String(data?.result_code) !== '1') {
        this.logger.error(`ok문자 API 실패: ${JSON.stringify(data)}`);
        throw new InternalServerErrorException({
          code: 'SMS_SEND_FAILED',
          message: 'SMS 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.',
        });
      }

      this.logger.log(`SMS 발송 성공 → ${params.to}`);
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      this.logger.error('ok문자 API 통신 오류', err);
      throw new InternalServerErrorException({
        code: 'SMS_SEND_FAILED',
        message: 'SMS 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      });
    }
  }
}
