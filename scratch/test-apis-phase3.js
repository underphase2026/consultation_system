const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3000/api';
const results = {};

async function request(method, endpoint, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  } catch (err) {
    return { status: 500, error: err.message };
  }
}

async function runTests() {
  console.log("🚀 Starting API Tests...");
  
  // 1. Auth: Register Owners (3 examples)
  results['Register Owner'] = [];
  const owners = [];
  for (let i = 4; i <= 6; i++) {
    const reqDto = {
      phoneNumber: `0101111000${i}`,
      password: `Password123!`,
      name: `사장님${i}`,
      isPhoneAuth: true,
      email: `owner${i}@test.com`,
      terms: { serviceAgreed: true, privacyAgreed: true, marketingAgreed: false }
    };
    const res = await request('POST', '/auth/register/owner', reqDto);
    results['Register Owner'].push({ reqDto, res });
    if (res.status === 201) owners.push(res.data);
  }

  // 2. Auth: Register Staff (3 examples)
  results['Register Staff'] = [];
  const staffs = [];
  for (let i = 4; i <= 6; i++) {
    const reqDto = {
      phoneNumber: `0102222000${i}`,
      password: `Password123!`,
      name: `직원${i}`,
      isPhoneAuth: true,
      terms: { serviceAgreed: true, privacyAgreed: true, marketingAgreed: true }
    };
    const res = await request('POST', '/auth/register/staff', reqDto);
    results['Register Staff'].push({ reqDto, res });
  }

  // 3. Auth: Login
  results['Login'] = [];
  const tokens = { owners: [], staffs: [] };
  for (let i = 4; i <= 6; i++) {
    const reqDtoOwner = { phoneNumber: `0101111000${i}`, password: `Password123!` };
    const resOwner = await request('POST', '/auth/login', reqDtoOwner);
    results['Login'].push({ type: 'Owner', reqDto: reqDtoOwner, res: resOwner });
    if (resOwner.status === 200 || resOwner.status === 201) tokens.owners.push(resOwner.data?.data?.accessToken || resOwner.data?.accessToken);

    const reqDtoStaff = { phoneNumber: `0102222000${i}`, password: `Password123!` };
    const resStaff = await request('POST', '/auth/login', reqDtoStaff);
    results['Login'].push({ type: 'Staff', reqDto: reqDtoStaff, res: resStaff });
    if (resStaff.status === 200 || resStaff.status === 201) tokens.staffs.push(resStaff.data?.data?.accessToken || resStaff.data?.accessToken);
  }

  // 4. Stores: Create (3 examples)
  results['Create Store'] = [];
  const stores = [];
  const businessNumbers = ['1234567894', '2345678905', '3456789016']; // Mock numbers
  for (let i = 0; i < 3; i++) {
    if (!tokens.owners[i]) continue;
    const reqDto = {
      storeBusinessName: `상호명${i+4}`,
      storeName: `매장명${i+4}`,
      businessRegistrationNumber: businessNumbers[i],
      postcode: `1234${i+4}`,
      detailedAddress: `서울시 강남구 테헤란로 ${i+4}`,
      storePhonenumber: `02123456${i+4}`
    };
    const res = await request('POST', '/stores', reqDto, tokens.owners[i]);
    results['Create Store'].push({ reqDto, res });
    if (res.status === 201) stores.push(res.data?.data || res.data);
  }

  // 5. Stores: Join (3 examples)
  results['Join Store'] = [];
  for (let i = 0; i < 3; i++) {
    if (!tokens.staffs[i] || !stores[i]) continue;
    const reqDto = { storeCode: stores[i].storeCode };
    const res = await request('POST', '/stores/join', reqDto, tokens.staffs[i]);
    results['Join Store'].push({ reqDto, res });
  }

  // 6. Contracts: Create (3 examples)
  results['Create Contract'] = [];
  const contracts = [];
  if (tokens.owners[0] && stores[0]) {
    const reqDto = { storeId: stores[0].storeId, customerName: '김고객', customerPhone: '01033334444' };
    const res = await request('POST', '/contracts', reqDto, tokens.owners[0]);
    results['Create Contract'].push({ by: 'Owner1', reqDto, res });
    if (res.status === 201) contracts.push(res.data?.data || res.data);
  }
  if (tokens.owners[1] && stores[1]) {
    const reqDto = { storeId: stores[1].storeId, customerName: '이고객', customerPhone: '01055556666' };
    const res = await request('POST', '/contracts', reqDto, tokens.owners[1]);
    results['Create Contract'].push({ by: 'Owner2', reqDto, res });
    if (res.status === 201) contracts.push(res.data?.data || res.data);
  }
  if (tokens.staffs[2] && stores[2]) {
    const reqDto = { storeId: stores[2].storeId, customerName: '박고객', customerPhone: '01077778888' };
    const res = await request('POST', '/contracts', reqDto, tokens.staffs[2]);
    results['Create Contract'].push({ by: 'Staff3', reqDto, res });
    if (res.status === 201) contracts.push(res.data?.data || res.data);
  }

  // 7. Contracts: Complete (3 examples)
  results['Complete Contract'] = [];
  for (let i = 0; i < contracts.length; i++) {
    const contract = contracts[i];
    const res = await request('PATCH', `/contracts/${contract.contractId}/esign-complete`);
    results['Complete Contract'].push({ contractId: contract.contractId, res });
  }

  // 8. CRM: Get Customers (3 examples)
  await new Promise(r => setTimeout(r, 1000));
  results['Get CRM Customers'] = [];
  for (let i = 0; i < stores.length; i++) {
    const res = await request('GET', `/crm/stores/${stores[i].storeId}/customers`, null, tokens.owners[i]);
    results['Get CRM Customers'].push({ storeId: stores[i].storeId, res });
  }

  // Write results
  fs.writeFileSync(path.join(__dirname, 'api-test-results-phase3.json'), JSON.stringify(results, null, 2));
  console.log("✅ API Tests completed. Results written.");
}

runTests();
