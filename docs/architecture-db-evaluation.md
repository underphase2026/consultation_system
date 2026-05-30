# Architecture & DB Evaluation Report

**작성자:** 수석 소프트웨어 아키텍트 (Chief Software Architect / DBA)
**대상 시스템:** 언더페이즈(Underphase) 통합 유무선 상담 및 견적 시스템
**작성일:** 2026-05-30

---

## 1. 아키텍처 및 DB 구조 요약 (Architecture & DB Overview)

현재 언더페이즈 백엔드는 **NestJS의 철저한 계층형(Layered) 아키텍처**와 **도메인 주도 설계(DDD) 패턴**을 융합하여 구성되어 있습니다.
데이터베이스는 **TypeORM**을 통해 RDBMS(PostgreSQL 등)와 연동되며, 최근 개선 작업을 통해 주요 모듈 간의 물리적 의존성이 해소되었습니다.

- **마스터 데이터 테이블 (`devices`):** 통신사(SKT, KT, LGU)로부터 크롤링된 출고가, 공시지원금 등의 기준 정보(Master Data)를 담고 있습니다. 
- **트랜잭션 데이터 테이블 (`quotes`):** 상담 결과로 확정된 단말기 가격의 **스냅샷(Snapshot)**을 기록하여 추후 가격 변동에 영향을 받지 않는 영속성을 보장합니다.
- **도메인 간 비동기 통신 (EDA):** `Consultations` 모듈에서 발생한 견적 생성(Quote Created) 이벤트가 `EventEmitter2`를 통해 `CRM` 모듈로 전달되어, 결합도(Coupling)를 완벽하게 분리한 아키텍처를 자랑합니다.

---

## 2. 데이터베이스 및 엔티티 설계 상세 분석 (DB & Entity Analysis)

### 2.1 도메인 격리 (Domain Isolation)
- `Quote` 엔티티는 내부 CRM 테이블(고객 정보 등)과 Foreign Key(FK)로 강하게 결합(Tight Coupling)되어 있지 않습니다.
- 물리적 외래키 제약 조건을 제거하고 `QuoteCreatedEvent`를 구독(Subscribe)하는 방식으로 CRM의 상태를 업데이트하도록 설계하여, 마이크로서비스(MSA)로의 분리가 용이한 완벽한 격리를 달성했습니다.

### 2.2 전자계약 확장성 및 무결성 (Electronic Contract Readiness & Integrity)
- **가격 스냅샷 설계:** `Quote` 엔티티에 `retailPrice`, `publicSubsidy`, `principal` 필드가 존재합니다. 이는 통신사 정책이 바뀌어 `Device` 원본 데이터가 갱신되더라도 이미 발행된 견적 금액은 보호되도록 하는 탁월한 정합성(Integrity) 설계입니다.
- **식별자 연동:** `Quote` 내부에 느슨한 결합 형태의 `contractId` 확장 필드를 두었고, `Contracts` 모듈에서는 `POST /electronic` 엔드포인트를 통해 즉각적으로 전자서명 템플릿(electronicContractId)과 매핑하는 준비가 완료되어 있습니다. 

### 2.3 쿼리 성능 최적화 (Query Performance)
- **복합 인덱스 및 Full-Text Search 적용:** `Device` 엔티티의 조회 속도 향상을 위해 `networkType`과 `carrier`를 조합한 기본 인덱스가 적용되어 있습니다. 
- 단말기명(`deviceName`)과 모델명(`modelName`)의 와일드카드(`LIKE`) 검색으로 인한 Table Full Scan을 방지하기 위해 `fulltext: true` 인덱스(PostgreSQL Trigram/GIN 최적화 고려)가 설정되어 있어, 인덱싱 설계도 훌륭하게 구축되었습니다.

---

## 3. 구조적 강점 (Strengths)

1. **테스트 및 방어 로직의 완결성:** TypeORM Repository의 Mocking을 통한 Unit Test와, Jest 기반 E2E Test가 구축되어 있어 CI/CD 파이프라인에서 데이터 정합성 충돌을 사전에 차단합니다.
2. **Redis 캐시 계층 도입:** `ConsultationsService` 단에 60초 TTL을 가진 Redis 기반 In-memory 캐싱이 도입되었습니다. 크롤링 봇의 잦은 데이터 Write 작업(Lock 경합)에도 Read 성능 저하를 방어할 수 있는 완충 지대를 확보했습니다.
3. **UUID(v4) 식별자 전략:** Primary Key로 UUID를 채택하여, 트래픽 급증 시의 ID 채번 병목(Auto-increment Lock) 현상을 미연에 방지하고 분산 환경에서의 확장성을 확보했습니다.

---

## 4. 잠재적 병목 및 아키텍처 개선 과제 (Bottlenecks & Action Items)

비록 최근 고도화를 통해 주요 병목은 해소되었으나, 추후 대규모 트래픽 및 시스템 확장을 대비한 다음의 액션 아이템을 권고합니다.

1. **데이터 누적 방어를 위한 이력(History) 테이블 분리:**
   - 크롤링 마스터 데이터(`Device`)가 지속 업데이트되면서 발생할 수 있는 오퍼레이션 로깅 및 과거 지원금 추이 조회를 위해, `devices_history` 테이블을 분리하고 CDC(Change Data Capture) 패턴을 적용할 필요가 있습니다.
2. **N+1 문제 사전 차단 (Join vs Eventual Consistency):**
   - 현재는 도메인이 분리되어 있어 N+1 문제가 발생하지 않으나, 프론트엔드에서 '회원의 견적 목록과 계약 진행 상태'를 한 번에 조회해야 하는 복합 화면(BFF 요구사항)이 생길 경우 병목이 예상됩니다. 
   - **해결책:** GraphQL Federation이나, 읽기 전용 뷰 데이터를 별도로 관리하는 **CQRS (Command Query Responsibility Segregation)** 패턴 도입을 중장기적으로 검토해야 합니다.
3. **분산 트랜잭션 (Saga Pattern) 고려:**
   - EDA 기반의 `QuoteCreatedEvent`가 네트워크나 CRM 서버 다운으로 인해 유실될 가능성이 존재합니다. 
   - **해결책:** 이벤트 발행 보장을 위한 **Outbox Pattern**과 메시지 브로커(RabbitMQ / Kafka) 도입을 통해 안정적인 도메인 통신망을 구축하는 것이 다음 페이즈의 최우선 과제입니다.
