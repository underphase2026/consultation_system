const fs = require('fs');

const swagger = JSON.parse(fs.readFileSync('swagger-spec.json', 'utf8'));

let md = `# 프론트엔드 연동을 위한 통합 API 명세서 (API Integration Guide)\n\n`;
md += `본 문서는 \`consist-sys-front\` 프론트엔드 프로젝트에서 백엔드 API를 연동할 때 참고할 수 있도록 구성된 핵심 컨텍스트 문서입니다.\n\n`;

md += `## 1. 프로젝트 도메인 및 구조 요약\n\n`;
md += `### 주요 도메인 모델\n`;
md += `- **Auth (인증)**: SMS 기반 본인인증, 회원가입 (대표/직원), JWT 발급 및 토큰 기반 인증\n`;
md += `- **Users (사용자)**: 회원 정보 조회 및 수정\n`;
md += `- **Stores (매장)**: 매장 생성, 합류, 조회 및 카카오 로컬 API를 통한 좌표 변환\n`;
md += `- **Consultations (상담/견적)**: 유무선 단말기 리스트 조회, 선택한 단말기를 기반으로 한 견적(Quote) 생성, 통합 견적 내역(BFF) 조회\n`;
md += `- **Electronic Contracts (전자계약)**: 서드파티(Third-party) 전자계약 상태 웹훅 수신 및 처리\n`;
md += `- **CRM (고객 관리)**: 고객 정보 및 상담 내역 연동\n\n`;

md += `### 주요 엔티티 및 핵심 구조\n`;
md += `- **User**: 사용자 계정 정보, 역할(OWNER, STAFF) 포함\n`;
md += `- **Store**: 매장 기본 정보(사업자 번호, 위치 등)\n`;
md += `- **Device**: 유무선 통신 단말기 정보(출고가, 공시지원금 등)\n`;
md += `- **Quote**: 단말기 정보를 기반으로 생성된 상담/견적 데이터 스냅샷\n`;
md += `- **ElectronicContract**: Quote와 연동되는 전자계약 문서 상태 추적 (진행중, 서명완료 등)\n\n`;

md += `## 2. 통합 API 명세 (Endpoints)\n\n`;

for (const [path, methods] of Object.entries(swagger.paths)) {
  for (const [method, details] of Object.entries(methods)) {
    md += `### [${method.toUpperCase()}] \`${path}\`\n`;
    md += `- **Summary**: ${details.summary || 'N/A'}\n`;
    md += `- **Description**: ${details.description || 'N/A'}\n`;
    
    // Security
    if (details.security && details.security.length > 0) {
      const secTokens = details.security.map(s => Object.keys(s)[0]).join(', ');
      md += `- **Auth Required**: Yes (${secTokens})\n`;
    } else {
      md += `- **Auth Required**: No\n`;
    }

    // Parameters
    if (details.parameters && details.parameters.length > 0) {
      md += `- **Parameters**:\n`;
      details.parameters.forEach(p => {
        md += `  - \`${p.in}\`: \`${p.name}\` (${p.required ? 'Required' : 'Optional'}) - ${p.description || ''}\n`;
      });
    }

    // Request Body
    if (details.requestBody && details.requestBody.content) {
      const contentType = Object.keys(details.requestBody.content)[0];
      const schemaRef = details.requestBody.content[contentType].schema.$ref;
      let schemaName = schemaRef ? schemaRef.split('/').pop() : 'inline object';
      md += `- **Request Body** (\`${contentType}\`): \`${schemaName}\`\n`;
    }

    // Responses
    md += `- **Responses**:\n`;
    for (const [status, res] of Object.entries(details.responses)) {
      md += `  - \`${status}\`: ${res.description || 'No description'}\n`;
      if (res.content) {
        const resContentType = Object.keys(res.content)[0];
        const resSchema = res.content[resContentType].schema;
        if (resSchema.$ref) {
          md += `    - Returns: \`${resSchema.$ref.split('/').pop()}\`\n`;
        } else if (resSchema.type === 'array' && resSchema.items && resSchema.items.$ref) {
          md += `    - Returns: \`Array<${resSchema.items.$ref.split('/').pop()}>\`\n`;
        } else if (resSchema.example) {
          md += `    - Returns: Example provided\n`;
        }
      }
    }
    md += `\n`;
  }
}

md += `## 3. 프론트엔드 연동 시 주의사항\n\n`;
md += `### 인증 (Authentication)\n`;
md += `- **JWT Access Token**: 로그인을 통해 발급받은 \`accessToken\`을 API 요청 시 헤더에 포함해야 합니다.\n`;
md += `  - Header: \`Authorization: Bearer <accessToken>\`\n`;
md += `- **Phone Verify Token**: 대표/직원 회원가입 시 SMS 인증을 먼저 거쳐야 하며, 인증 성공 시 발급받는 단기 토큰(\`phoneVerifyToken\`)을 가입 요청 시 동일하게 헤더에 포함해야 합니다.\n\n`;

md += `### 공통 응답 포맷 (Common Response Format)\n`;
md += `- 성공 시 일반적으로 200 또는 201 상태 코드와 함께 요청한 데이터를 JSON 형태로 반환합니다.\n`;
md += `- 일부 단순 작업(수정, 삭제 등)은 \`{ "message": "..." }\` 형태의 \`MessageResponseDto\`를 반환합니다.\n`;
md += `- 에러 발생 시 표준 HTTP 상태 코드(400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error)를 사용하며, NestJS 기본 에러 포맷인 \`{ "statusCode": 400, "message": "error reason", "error": "Bad Request" }\` 형태를 따릅니다.\n`;

fs.writeFileSync('../consist-sys-front/API_INTEGRATION_GUIDE.md', md);
console.log('Markdown generated successfully.');
