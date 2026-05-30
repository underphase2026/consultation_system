# Frontend API Reference

본 문서는 언더페이즈(Underphase) 프로젝트의 프론트엔드-백엔드 연동을 위한 통합 API 명세서입니다.
모든 Request/Response의 필드명은 외부 인터페이스 규약인 `snake_case`를 따르며, 인증이 필요한 API는 `AuthGuard` 통과를 위해 `Authorization: Bearer <token>` 헤더가 필요합니다.

---

## 1. Auth & User API (인증 및 유저 관리)

### 1.1. SMS 인증번호 발송
- **Endpoint:** `POST /api/auth/sms/send`
- **Auth Guard:** No
- **Description:** 입력한 휴대폰 번호로 6자리 인증번호를 발송합니다. (분당 3회 제한, 3분 유효)

**Request**
```json
{
  "phone_number": "01012345678"
}
```

**Response (200 OK)**
```json
{
  "message": "인증번호가 발송되었습니다."
}
```

### 1.2. SMS 인증번호 검증
- **Endpoint:** `POST /api/auth/sms/verify`
- **Auth Guard:** No
- **Description:** 인증번호 검증 후 5분간 유효한 `phoneVerifyToken`을 반환합니다. 회원가입 시 이 토큰이 필요합니다.

**Request**
```json
{
  "phone_number": "01012345678",
  "verification_code": "382910"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "phone_verify_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 300
  }
}
```

### 1.3. 대표(OWNER) 회원가입
- **Endpoint:** `POST /api/auth/register/owner`
- **Auth Guard:** `Bearer <phoneVerifyToken>` (Authorization 헤더)

**Request**
```json
{
  "name": "홍길동",
  "phone_number": "01012345678",
  "email": "owner@example.com",
  "password": "Password1234!",
  "terms": {
    "service_agreed": true,
    "privacy_agreed": true,
    "marketing_agreed": false
  }
}
```

**Response (201 Created)**
```json
{
  "message": "Owner registered successfully.",
  "user_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
}
```

### 1.4. 로그인
- **Endpoint:** `POST /api/auth/login`
- **Auth Guard:** No

**Request**
```json
{
  "phone_number": "01012345678",
  "password": "Password1234!"
}
```

**Response (200 OK)**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 1.5. 내 정보 조회
- **Endpoint:** `GET /api/users/me`
- **Auth Guard:** Yes (`Bearer <accessToken>`)

**Response (200 OK)**
```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "phone_number": "01012345678",
  "name": "홍길동",
  "email": "test@example.com",
  "role": "OWNER",
  "referral_code": "ABCDEF"
}
```

---

## 2. Store API (매장 관리)

### 2.1. 매장 등록 (OWNER 전용)
- **Endpoint:** `POST /api/stores`
- **Auth Guard:** Yes (OWNER 권한)

**Request**
```json
{
  "store_business_name": "홍길동통신",
  "store_name": "홍길동 강남점",
  "business_registration_number": "1234567890",
  "postcode": "06234",
  "road_address": "서울 강남구 테헤란로 123",
  "jibun_address": "서울 강남구 역삼동 123",
  "detailed_address": "2층 201호",
  "lat": 37.5005,
  "lng": 127.0364,
  "store_phonenumber": "0212345678"
}
```

**Response (201 Created)**
```json
{
  "store_id": "b2c3d4e5-f6a7-8901-2345-678901abcdef",
  "store_name": "홍길동 강남점",
  "store_code": "ABCD1234"
}
```

### 2.2. 매장 합류 (STAFF 전용)
- **Endpoint:** `POST /api/stores/join`
- **Auth Guard:** Yes (STAFF 권한)

**Request**
```json
{
  "store_code": "ABCD1234"
}
```

**Response (200 OK)**
```json
{
  "store_id": "b2c3d4e5-f6a7-8901-2345-678901abcdef",
  "store_name": "홍길동 강남점"
}
```

### 2.3. 내 매장 목록 조회
- **Endpoint:** `GET /api/stores/mine`
- **Auth Guard:** Yes

**Response (200 OK)**
```json
[
  {
    "store_id": "b2c3d4e5-f6a7-8901-2345-678901abcdef",
    "store_name": "홍길동 강남점",
    "address": "서울 강남구 테헤란로 123, 2층",
    "rate": "프리미엄 요금제",
    "owner_name": "홍길동",
    "phone_number": "0212345678"
  }
]
```

---

## 3. Crawling API (공시지원금 크롤링)

> **Note:** 본 API는 스케줄러 기반의 크롤링 외에 수동으로 데이터를 갱신하거나 조회해야 할 때 사용되는 엔드포인트입니다.

### 3.1. 통신사 공통지원금 갱신/조회
- **Endpoint:** `GET /api/crawling/getSubsidy` (또는 `/api/{carrier}/crawl`)
- **Auth Guard:** Yes
- **Description:** 특정 통신사(SKT, KT, LGU) 또는 스마트초이스의 크롤링을 트리거하여 최신 공시지원금을 반영합니다.

**Request (Query Parameters)**
- `carrier`: "SKT" | "KT" | "LGU" | "ALL"

**Response (200 OK)**
```json
{
  "message": "크롤링이 성공적으로 완료되었습니다.",
  "updated_count": 152,
  "carrier": "SKT",
  "last_updated": "2026-05-30T07:30:00Z"
}
```

---

## 4. Consultation & Quote API (통합 유무선 상담 및 견적 시스템)

### 4.1. 단말기 리스트 및 검색 (가격 계산 포함)
- **Endpoint:** `GET /api/consultations/devices`
  *(참고: Swagger에는 `/api/api/consultations/devices`로 노출되어 있을 수 있으나, 프론트엔드 연동 시 글로벌 프리픽스 규칙에 따라 맞추어 사용 바랍니다.)*
- **Auth Guard:** Yes (`Bearer <accessToken>`)
- **Description:** 선택된 유무선 구분과 통신사에 맞춰 단말기 목록을 조회합니다. 출고가, 공시지원금, 할부원금이 즉시 계산되어 반환됩니다.

**Request (Query Parameters)**
- `network_type` (Required): `WIRELESS` | `WIRED`
- `carrier` (Required): `SKT` | `KT` | `LGU`
- `search_type` (Optional): `DEVICE_NAME` | `MODEL_NAME`
- `keyword` (Optional): 검색어 (예: "아이폰", "SM-G991N")

**Response (200 OK)**
```json
[
  {
    "id": "device-uuid-1",
    "network_type": "WIRELESS",
    "carrier": "SKT",
    "device_name": "iPhone 15 Pro",
    "model_name": "A3102",
    "retail_price": 1500000,
    "public_subsidy": 300000,
    "principal": 1200000
  },
  {
    "id": "device-uuid-2",
    "network_type": "WIRELESS",
    "carrier": "SKT",
    "device_name": "Galaxy S24",
    "model_name": "SM-S921N",
    "retail_price": 1200000,
    "public_subsidy": 500000,
    "principal": 700000
  }
]
```

### 4.2. 통합 견적 생성
- **Endpoint:** `POST /api/consultations/quotes`
- **Auth Guard:** Yes (`Bearer <accessToken>`)
- **Description:** 단말기 검색 후, 특정 단말기를 선택하여 견적(Quote)을 생성합니다. 해당 시점의 가격 스냅샷이 DB에 저장되어 이후 전자계약 시퀀스로 원활하게 넘어갈 수 있습니다.

**Request**
```json
{
  "network_type": "WIRELESS",
  "carrier": "SKT",
  "device_id": "device-uuid-1"
}
```

**Response (201 Created)**
```json
{
  "id": "quote-uuid-1234",
  "network_type": "WIRELESS",
  "carrier": "SKT",
  "device_id": "device-uuid-1",
  "device_name": "iPhone 15 Pro",
  "retail_price_snapshot": 1500000,
  "public_subsidy_snapshot": 300000,
  "principal_snapshot": 1200000,
  "created_at": "2026-05-30T07:35:00Z"
}
```

---
> **Notice:** `400 Bad Request` 에러 발생 시, 응답 바디에는 유효성 검사 실패 사유가 포함되며, `401 Unauthorized`의 경우 토큰 재발급이나 재로그인이 필요합니다.
