export interface Store {
  id: string;
  ownerId: string;            // User.id (OWNER)
  storeBusinessName: string; // 사업자등록증 상 상호명
  storeName: string;         // 매장 표시명
  businessRegistrationNumber: string;
  postcode: string;
  detailedAddress: string;
  storePhonenumber?: string;  // 매장 전화번호 (선택)
  storeCode: string;          // 직원 합류 코드 (자동 생성)
  rate?: string;              // 적용 요금제
  staffIds: string[];         // 소속 직원 User.id 목록
  createdAt: Date;
}
