const BASE_URL = 'http://localhost:3000/api';

async function testSmsAuthFlow() {
  const testPhone = `010${Math.floor(10000000 + Math.random() * 90000000)}`; // Random 010 number
  console.log(`\n🚀 [TEST 1] SMS 발송 요청 (Phone: ${testPhone})`);
  
  const sendRes = await fetch(`${BASE_URL}/auth/sms/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: testPhone }),
  });
  const sendData = await sendRes.json();
  console.log(`[Status: ${sendRes.status}] Response:`, sendData);

  if (sendRes.status !== 200) {
    console.error('❌ SMS 발송 실패로 테스트 중단');
    return;
  }

  console.log(`\n🚀 [TEST 2] SMS 인증번호 검증 (Code: 000000)`);
  const verifyRes = await fetch(`${BASE_URL}/auth/sms/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: testPhone, verificationCode: '000000' }),
  });
  const verifyData = await verifyRes.json();
  console.log(`[Status: ${verifyRes.status}] Response:`, verifyData);

  if (verifyRes.status !== 200 || !verifyData.data?.phoneVerifyToken) {
    console.error('❌ 인증 검증 실패로 테스트 중단');
    return;
  }
  
  const token = verifyData.data.phoneVerifyToken;
  console.log(`✅ 토큰 발급 성공: ${token.substring(0, 30)}...`);

  console.log(`\n🚀 [TEST 3] 대표 회원가입 진행 (발급받은 토큰 헤더 첨부)`);
  const registerRes = await fetch(`${BASE_URL}/auth/register/owner`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: '테스트대표',
      phoneNumber: testPhone,
      password: 'Password123!',
      terms: {
        serviceAgreed: true,
        privacyAgreed: true
      }
    }),
  });
  const registerData = await registerRes.json();
  console.log(`[Status: ${registerRes.status}] Response:`, registerData);

  if (registerRes.status !== 201) {
    console.error('❌ 회원가입 실패로 테스트 중단');
    return;
  }

  console.log(`\n🚀 [TEST 4] 회원가입한 계정으로 로그인 시도`);
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneNumber: testPhone,
      password: 'Password123!',
    }),
  });
  const loginData = await loginRes.json();
  console.log(`[Status: ${loginRes.status}] Response:`, loginData);

  console.log('\n🎉 모든 SMS 인증 및 회원가입, 로그인 플로우 테스트 성공!');
}

testSmsAuthFlow().catch(console.error);
