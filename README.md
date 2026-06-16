<div align="center">
  <h1>🌟 Underphase Consultation System 🌟</h1>
  <p><strong>통신 매장 정보 및 상담 관리를 위한 강력한 백엔드 시스템</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/TypeORM-FE0803?style=for-the-badge&logo=TypeORM&logoColor=white" alt="TypeORM" />
  </p>
</div>

<br />

## 📖 프로젝트 소개 (Description)
**Underphase Consultation System**은 통신 매장의 정보 관리 및 효율적인 상담 시스템을 지원하기 위해 구축된 백엔드 서비스입니다. 
점주(Owner)와 직원(Staff)의 권한을 분리하여 안전하게 매장을 관리할 수 있으며, 휴대폰 상담, 기기/요금제 정보, 임시 견적 데이터 동기화 등을 포괄적으로 지원합니다.

<br />

## 🚀 최근 진행 상황 (Updates)

*   **📱 단말기 및 상담 도메인(`Consultations`):** 
    *   기기 목록 조회 API 구축 (Redis 캐싱 최적화 반영)
    *   멀티 탭 동기화를 위한 `UserTabs` 테이블 및 임시 견적(`temp-quotes`) API 구현
    *   Transaction 및 Outbox Pattern을 활용한 견적 생성 이벤트 처리 안정화
*   **📍 위치 정보 고도화:** 매장 가입 시 Kakao Local API를 통한 Daum 우편번호 기반 위경도 변환 로직 통합
*   **🔒 인증 및 접근 제어 로직 고도화:** 토큰 기반 인증 및 `OWNER`/`STAFF` Role 기반 미들웨어 최적화

<br />

## ✨ 주요 기능 (Key Features)

### 🏬 매장 관리 (Store Management)
- **매장 등록 및 조회:** 점주 전용 매장 등록 및 내 매장 목록 조회 기능
- **직원 합류 시스템:** 직원이 매장 코드(`storeCode`)를 통해 매장에 합류하는 기능
- **사업자 등록번호 진위 확인:** 공공데이터 포털 API 연동을 통한 사업자 번호 유효성 사전 검증
- **카카오 로컬 API 연동:** 주소 검색 시 자동으로 위/경도(lat, lng) 좌표 변환 및 정제된 주소 정보 제공

### 🔐 권한 및 인증 (Authentication & Authorization)
- **역할 기반 접근 제어 (RBAC):** `OWNER`와 `STAFF` 역할에 따른 API 접근 권한 제어
- **JWT 기반 인증:** 안전한 Access Token 및 비밀번호 재설정 토큰 관리
- **(분리됨) SMS 문자 인증 서비스:** 회원가입 시 본인 인증을 위한 SMS 발송 로직은 [Authentication_Message](https://github.com/underphase2026/Authentication_Message) 마이크로서비스로 분리되어 독립적으로 운영됩니다.

### 💼 상담 및 견적 관리 (Consultation System)
- **단말기 정보(`Device`) 조회:** 통신사, 유무선 구분, 기종 등에 따른 실시간 지원금 및 출고가 조회
- **임시 견적 보관(`Temp Quotes`):** 프론트엔드의 다중 탭 기능과 연계하여 상담 진행 중인 견적을 서버에 안전하게 임시 보관
- **단말기 가격 변동 이력(`History`):** 출고가 및 공시지원금 변동 내역을 별도 테이블로 관리하여 투명성 보장

<br />

## 🛠️ 기술 스택 (Tech Stack)

| Category | Technology |
| --- | --- |
| **Framework** | NestJS |
| **Language** | TypeScript |
| **Database ORM** | TypeORM |
| **Caching** | Redis (Cache Manager) |
| **API 연동** | Axios (@nestjs/axios), Kakao Local API |
| **Validation** | class-validator, class-transformer |

<br />

## ⚙️ 설치 및 실행 (Installation & Running)

### 1. 패키지 설치
```bash
$ npm install
```

### 2. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 값을 채워주세요.
```env
# Server
PORT=3000

# Database (예시)
DB_HOST=localhost
DB_PORT=5432
DB_USER=username
DB_PASSWORD=password
DB_NAME=consultation_db

# Kakao API (주소/좌표 변환용)
KAKAO_REST_API_KEY=your_kakao_api_key_here

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

### 3. 프로젝트 실행
```bash
# 개발 모드 (Watch mode)
$ npm run start:dev

# 프로덕션 빌드 및 실행
$ npm run build
$ npm run start:prod
```

<br />

## 🔗 연관 프로젝트 (Related Projects)
- **[Authentication_Message](https://github.com/underphase2026/Authentication_Message)**: 독립적인 SMS 문자 인증 처리를 담당하는 마이크로서비스입니다.
- **[consist-sys-front](https://github.com/underphase2026/consult-sys-front)**: 본 서비스의 React 기반 프론트엔드 레포지토리입니다.

<br />

## 📄 라이선스 (License)
이 프로젝트는 **Underphase**에 귀속되어 있습니다.