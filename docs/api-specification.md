# [도메인] 통합 유무선 상담 및 견적 관리 API 명세서

## 1. 단말기 리스트 및 검색 API
- **Method & URL:** `GET /api/consultations/devices`
- **인증 여부:** `AuthGuard` (JWT 인증 필요)
- **기능 설명:** 유무선 구분과 통신사 정보를 기준으로 단말기 리스트를 조회합니다. 선택적으로 기종명(`DEVICE_NAME`) 또는 모델명(`MODEL_NAME`)을 통해 동적(LIKE) 검색이 가능합니다. 성능 최적화를 위해 복합 인덱스를 타며, 할부원금은 DB에 저장하지 않고 호출 시점 서버에서 실시간 계산(`retail_price` - `public_subsidy`)하여 응답합니다.
- **Request Query Parameters:**

| 필드명 | 타입 | 필수 여부 | 설명 |
|---|---|---|---|
| `network_type` | Enum (String) | Y | 유무선 구분 (`WIRELESS`, `WIRED`) |
| `carrier` | Enum (String) | Y | 통신사 (`SKT`, `KT`, `LGU`) |
| `search_type` | Enum (String) | N | 검색 조건 지정 (`DEVICE_NAME` 또는 `MODEL_NAME`) |
| `keyword` | String | N | 검색어 (부분 일치 검색) |

- **Response Body (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "network_type": "WIRELESS",
    "carrier": "SKT",
    "device_name": "아이폰15 Pro",
    "model_name": "A3102",
    "retail_price": 1550000,
    "public_subsidy": 450000,
    "principal": 1100000
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "network_type": "WIRELESS",
    "carrier": "SKT",
    "device_name": "아이폰15",
    "model_name": "A3090",
    "retail_price": 1250000,
    "public_subsidy": 500000,
    "principal": 750000
  }
]
```
- **필드 설명:**
  - `retail_price`: 단말기 출고가
  - `public_subsidy`: 공시지원금
  - `principal`: 할부원금 (출고가 - 공시지원금, 서버 자동계산)

- **Error Responses:**
  - `400 Bad Request`: 필수 Query Parameter 누락 또는 허용되지 않은 Enum 값 전달
  - `401 Unauthorized`: 헤더에 인증 토큰이 없거나 만료된 경우

## 2. 통합 견적 생성 API
- **Method & URL:** `POST /api/consultations/quotes`
- **인증 여부:** `AuthGuard` (JWT 인증 필요)
- **기능 설명:** 클라이언트가 최종 선택한 단말기의 정보(`device_id`)를 바탕으로 즉시 가격 스냅샷(Snapshot)을 떠서 새로운 견적(`Quote`)을 생성합니다. 백엔드에서 보안 및 데이터 무결성을 위해 `quote_name`(`[통신사] 기종명`)과 `tag`(`유선` 또는 `무선`)를 자동 생성하여 매핑합니다. 
- **Request Body:**

| 필드명 | 타입 | 필수 여부 | 설명 |
|---|---|---|---|
| `network_type` | Enum (String) | Y | 유무선 구분 (`WIRELESS`, `WIRED`) |
| `carrier` | Enum (String) | Y | 통신사 (`SKT`, `KT`, `LGU`) |
| `device_id` | Number | Y | 선택한 단말기의 고유 ID |

```json
{
  "network_type": "WIRELESS",
  "carrier": "SKT",
  "device_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

- **Response Body (201 Created):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655441111",
  "quote_name": "[SKT] 아이폰15 Pro",
  "tag": "무선",
  "network_type": "WIRELESS",
  "carrier": "SKT",
  "device_id": "550e8400-e29b-41d4-a716-446655440000",
  "retail_price": 1550000,
  "public_subsidy": 450000,
  "principal": 1100000,
  "contract_id": null,
  "created_at": "2026-05-30T00:25:10.000Z",
  "updated_at": "2026-05-30T00:25:10.000Z"
}
```
- **필드 설명:**
  - `quote_name`: `[통신사] 기종명` 형식으로 서버 자동 생성
  - `tag`: `network_type`에 따라 `유선` 또는 `무선`으로 서버 자동 생성
  - `contract_id`: 향후 전자계약 연동을 위해 예약된 필드 (기본값 null)
  - `retail_price`, `public_subsidy`, `principal`: 견적 생성 시점의 스냅샷 가격

- **Error Responses:**
  - `400 Bad Request`: 요청한 `network_type` 또는 `carrier`가 실제 `device_id` 정보와 일치하지 않음
  - `401 Unauthorized`: 인증 토큰 누락 및 만료
  - `404 Not Found`: 전달된 `device_id`에 해당하는 단말기가 존재하지 않음
  - `409 Conflict`: 단말기 선택 시점과 견적 생성 시점 사이 가격 변동 충돌 발생 시
