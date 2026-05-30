# Underphase Project Analysis: Post-Mortem & Architecture Review

**작성자:** 수석 소프트웨어 아키텍트 (Chief Software Architect)
**작성일:** 2026-05-30
**대상 프로젝트:** 언더페이즈(Underphase) 통합 유무선 상담 및 견적 시스템

---

## 1. 프로젝트 현황 요약 (Executive Summary)

현재 언더페이즈 프로젝트는 **통신사 정책 자동 크롤링을 기반으로 한 유무선 상담 및 견적 생성 시스템**의 1차 구현을 성공적으로 완료했습니다. 백엔드는 **NestJS + TypeORM** 환경에서 구축되었으며, 프론트엔드는 **React**를 통해 API 연동을 준비 중입니다. 

**전체 워크플로우 요약:**
1. **데이터 수집:** 통신사(SKT, KT, LGU)의 단말기 정보 및 공시지원금 데이터를 크롤링(또는 관리자 수동 입력)하여 데이터베이스에 적재합니다.
2. **조회 및 계산:** 사용자가 유무선 구분, 통신사, 검색어 등을 통해 단말기를 검색하면, 현재 시점의 출고가, 공시지원금, 할부원금을 즉시 계산하여 반환합니다 (`/api/consultations/devices`).
3. **견적 생성:** 고객과의 상담 중 특정 단말기 조건이 확정되면, 해당 시점의 가격 스냅샷(Snapshot)을 포함한 견적(Quote) 데이터를 생성합니다 (`/api/consultations/quotes`).

**핵심 기술 스택 및 아키텍처 패턴:**
- **Backend:** NestJS, TypeScript, TypeORM, Jest (Unit/E2E Testing)
- **Database:** PostgreSQL (또는 RDBMS) - UUID 기반 식별자(`PrimaryGeneratedColumn('uuid')`) 적용.
- **Architecture Pattern:** 도메인 주도 설계(DDD) 관점을 차용한 **모듈화 아키텍처(Modular Architecture)**. `users`, `stores`, `auth`, `crm`, `contracts`, `consultations` 등 철저한 도메인 분리 적용.

---

## 2. 아키텍처 및 도메인 분석 (Architecture Analysis)

### 2.1. 도메인 격리성 평가 (Domain Isolation)
현재 `Consultations`(상담/견적) 모듈은 `CRM`(고객 관리) 모듈과 **매우 훌륭하게 격리(Decoupled)**되어 있습니다. 
- 견적(`Quote`) 엔티티는 특정 고객(Customer)이나 기존 사내 CRM 테이블의 Foreign Key를 강제하지 않습니다. 
- 이는 고객 정보가 완전히 등록되지 않은 **익명 방문자**나 **단순 문의자**에게도 견적을 즉각 발행할 수 있는 유연성을 제공합니다.
- 데이터베이스 레벨의 Hard FK 제약을 배제하고 논리적 참조(ID 기반)만 남겨두어, 추후 CRM 마이크로서비스가 분리되더라도 시스템이 깨지지 않는 구조를 확보했습니다.

### 2.2. 전자계약 확장성 평가 (Electronic Contract Readiness)
생성된 `Quote` 데이터는 내부의 구형 계약 시스템보다 **'전자계약 시퀀스'로 즉시 넘어가기 완벽한 구조**를 갖추고 있습니다.
- 견적서 내부에 `contractId` 필드를 Nullable로 설계하여, 견적이 전자계약으로 전환되는 시점에 식별자 매핑만으로 트랜잭션을 연결할 수 있습니다.
- **불변성(Immutability) 보장:** `Quote` 테이블에 `retailPrice`, `publicSubsidy`, `principal` 등 가격 관련 필드를 **스냅샷(Snapshot)** 형태로 저장합니다. 통신사 정책이 변경되어 `Device` 원본 데이터가 바뀌더라도, 이미 발행된 견적서와 전자계약의 금액은 훼손되지 않아 데이터 무결성이 보장됩니다.

### 2.3. 데이터베이스 설계 평가
- `id`를 Auto-increment Integer 대신 **UUID(v4)**로 전환한 것은 분산 환경 및 클라이언트 사이드 ID 채번, 그리고 보안(ID 예측 방지) 측면에서 탁월한 선택입니다.
- 마스터 데이터(`Device`)와 트랜잭션 데이터(`Quote`) 간의 책임이 명확히 분리되어 있어, 조회 성능과 데이터 정합성 유지 관점에서 견고합니다.

---

## 3. 성과 및 기술적 강점 (Strengths & Accomplishments)

1. **테스트 커버리지 및 안정성:** 
   - `Jest`를 활용해 DB 의존성 없는 순수 비즈니스 로직(Unit Test)과 통합 환경(E2E Test) 검증을 완료했습니다. 
   - 의존성 주입(DI)과 Mocking을 활용하여 테스트 속도를 극대화하고 리소스 누수를 방지한 점은 아키텍처적 완성도를 높입니다.
2. **에러 방어 및 엣지 케이스 처리:**
   - E2E 테스트 과정에서 나타난 `uuid` 라이브러리의 ESM/CommonJS 충돌, 비동기 리소스 누수(Open Handles) 문제를 완벽히 해결하여 런타임 안정성을 확보했습니다.
3. **프론트엔드 친화적 설계:**
   - Request/Response를 `snake_case`로 통일하고 명세서를 현행화함으로써 프론트엔드-백엔드 간의 병렬 개발(Parallel Development)을 가능케 했습니다.

---

## 4. 잠재적 병목 및 개선 사항 (Weaknesses & Improvements)

1. **대규모 트래픽 발생 시 DB 병목 (Backend/DB):**
   - **단말기 검색 쿼리:** `ConsultationsController.getDevices`에서 `searchType`(기종명, 모델명)과 `keyword`를 통한 `LIKE` 검색이 발생합니다. 데이터가 쌓일 경우 `ILIKE` 연산은 Table Full Scan을 유발해 치명적인 병목이 될 수 있습니다.
   - **조치 필요:** 단말기 검색 필드(`deviceName`, `modelName`)에 대해 **Trigram Index (pg_trgm)** 또는 **Full-Text Search Index**를 추가해야 합니다.
2. **공시지원금 데이터의 잦은 갱신 이슈 (Backend/DB):**
   - 크롤링 봇에 의해 단말기 테이블 업데이트가 빈번하게 일어납니다. 쓰기 락(Write Lock)으로 인해 조회(Read) 성능이 저하될 수 있습니다.
   - **조치 필요:** 자주 조회되는 통신사별 최신 단말기 목록은 **Redis 캐싱 (TTL 설정)**을 도입하여 DB 부하를 분산해야 합니다.
3. **프론트엔드(React) 렌더링 최적화 (Frontend):**
   - 검색 시 타이핑마다 API 콜이 발생한다면 서버 부하가 극심해집니다.
   - **조치 필요:** React 측 검색 입력 폼에 반드시 **디바운싱(Debouncing, 약 300ms~500ms)** 처리를 적용하고, `react-query`나 `SWR`을 활용해 캐싱 및 Stale-time 관리를 철저히 해야 합니다.

---

## 5. Next Step (다음 스프린트 제안)

### 단기적 액션 아이템 (다음 스프린트 반영)
1. **전자계약 우선 매칭 로직 개발:**
   - 기존의 "단순 견적 -> 상담 종료" 흐름이 아니라, `POST /api/consultations/quotes` 응답 즉시 프론트엔드에서 **"전자계약서 발송(알림톡/SMS)" UI**로 유도하는 플로우를 구현해야 합니다.
   - 백엔드에 `POST /api/contracts/electronic` 엔드포인트를 신설하여, 전달받은 `quote_id`를 기반으로 전자 서명 템플릿을 생성 및 매핑하는 로직을 추가합니다.
2. **성능 튜닝 (캐싱 & 인덱싱):**
   - TypeORM Entity에 `@Index` 데코레이터를 활용하여 `networkType`, `carrier` 필드에 복합 인덱스(Composite Index)를 생성합니다.
   - 단말기 리스트 조회 서비스에 NestJS 기본 `CacheModule`을 적용하여 초당 수백 건의 동일 검색 요청을 방어합니다.

### 중장기 리팩토링 로드맵
1. **이벤트 기반 아키텍처(EDA) 전환:** 
   - 견적이 생성(`QuoteCreatedEvent`)되거나 전자계약이 체결(`ContractSignedEvent`)될 때, NestJS의 `EventEmitter2`를 활용하여 느슨하게 이벤트를 발송합니다.
   - CRM 모듈은 이 이벤트를 구독(Subscribe)하여 고객의 상태(단순 문의 → 계약 진행 중 → 개통 완료)를 비동기적으로 업데이트하도록 설계합니다. 이렇게 하면 두 도메인이 완벽히 분리된 상태에서 상호작용할 수 있습니다.
2. **외부 크롤링 서비스의 MSA 분리:**
   - 통신사 크롤링 로직이 무거워질 경우, 이를 메인 API 서버에서 분리하여 Python(또는 Go) 기반의 독립된 크롤러 워커 스레드로 분리하고 Message Queue(RabbitMQ/Kafka)를 통해 통신하는 구조를 고려해야 합니다.

---
**총평:**
언더페이즈(Underphase)의 1차 상담 시스템 아키텍처는 유연성과 확장성(특히 스냅샷 기반의 전자계약 준비성) 측면에서 매우 견고하게 설계되었습니다. 제시된 병목 구간(검색 인덱스 부재, 캐싱 누락)만 다음 스프린트 초기에 해결한다면 대규모 트래픽과 전자계약 시퀀스로의 확장을 성공적으로 감당할 수 있을 것입니다.
