const mysql = require('mysql2/promise');
const crypto = require('crypto');

async function seedSpecs() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3308,
    user: 'root',
    password: '1234',
    database: 'under_phase'
  });

  const specsData = [
    { model: 'SM-S948N', cpu: 'Snapdragon 8 Elite Gen 5', ram: '12GB', storage: '256GB / 512GB / 1TB', display: '6.9인치 M14 OLED', camera: '전면: 1200만\\n후면: 2억+5000만+5000만+1000만', battery: '5000mAh', weight: '214g' },
    { model: 'SM-S946N', cpu: 'Snapdragon 8 Elite Gen 5', ram: '12GB', storage: '256GB / 512GB', display: '6.7인치 M14 OLED', camera: '전면: 1200만\\n후면: 5000만+1200만+1000만', battery: '4900mAh', weight: '196g' },
    { model: 'SM-S941N', cpu: 'Snapdragon 8 Elite Gen 5', ram: '12GB', storage: '256GB / 512GB', display: '6.2인치 M14 OLED', camera: '전면: 1200만\\n후면: 5000만+1200만+1000만', battery: '4000mAh', weight: '168g' },
    { model: 'SM-F956N', cpu: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '256GB / 512GB / 1TB', display: '7.6인치 / 6.3인치 Dynamic AMOLED 2X', camera: '전면: 1000만/400만\\n후면: 5000만+1200만+1000만', battery: '4400mAh', weight: '239g' },
    { model: 'SM-F741N', cpu: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '256GB / 512GB', display: '6.7인치 / 3.4인치 Dynamic AMOLED 2X', camera: '전면: 1000만\\n후면: 5000만+1200만', battery: '4000mAh', weight: '187g' },
    { model: 'SM-S928N', cpu: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '256GB / 512GB / 1TB', display: '6.8인치 Dynamic AMOLED 2X', camera: '전면: 1200만\\n후면: 2억+5000만+1200만+1000만', battery: '5000mAh', weight: '232g' },
    { model: 'SM-S926N', cpu: 'Exynos 2400', ram: '12GB', storage: '256GB / 512GB', display: '6.7인치 Dynamic AMOLED 2X', camera: '전면: 1200만\\n후면: 5000만+1200만+1000만', battery: '4900mAh', weight: '196g' },
    { model: 'SM-S938N', cpu: 'Snapdragon 8 Elite', ram: '12GB', storage: '256GB / 512GB / 1TB', display: '6.9인치 Dynamic AMOLED 2X', camera: '전면: 1200만\\n후면: 2억+5000만+5000만+5000만', battery: '5000mAh', weight: '218g' },
    { model: 'SM-S936N', cpu: 'Snapdragon 8 Elite', ram: '12GB', storage: '256GB / 512GB', display: '6.7인치 Dynamic AMOLED 2X', camera: '전면: 1200만\\n후면: 5000만+1200만+1000만', battery: '4900mAh', weight: '195g' },
    { model: 'SM-S931N', cpu: 'Snapdragon 8 Elite', ram: '12GB', storage: '256GB / 512GB', display: '6.2인치 Dynamic AMOLED 2X', camera: '전면: 1200만\\n후면: 5000만+1200만+1000만', battery: '4000mAh', weight: '167g' },
    { model: 'IP17-PM', cpu: 'Apple A19 Pro', ram: '12GB', storage: '256GB / 512GB / 1TB', display: '6.9인치 Super Retina XDR OLED', camera: '전면: 2400만\\n후면: 4800만+4800만+4800만', battery: '4800mAh', weight: '225g' },
    { model: 'IP17-P', cpu: 'Apple A19 Pro', ram: '12GB', storage: '256GB / 512GB / 1TB', display: '6.3인치 Super Retina XDR OLED', camera: '전면: 2400만\\n후면: 4800만+4800만+4800만', battery: '3500mAh', weight: '195g' },
    { model: 'IP17-PL', cpu: 'Apple A19', ram: '8GB', storage: '128GB / 256GB / 512GB', display: '6.7인치 Super Retina XDR OLED', camera: '전면: 2400만\\n후면: 4800만+1200만', battery: '4500mAh', weight: '200g' },
    { model: 'IP17', cpu: 'Apple A19', ram: '8GB', storage: '128GB / 256GB / 512GB', display: '6.1인치 Super Retina XDR OLED', camera: '전면: 2400만\\n후면: 4800만+1200만', battery: '3400mAh', weight: '170g' },
    { model: 'IP16-PM', cpu: 'Apple A18 Pro', ram: '8GB', storage: '256GB / 512GB / 1TB', display: '6.9인치 Super Retina XDR OLED', camera: '전면: 1200만\\n후면: 4800만+4800만+1200만', battery: '4685mAh', weight: '227g' },
    { model: 'IP16-P', cpu: 'Apple A18 Pro', ram: '8GB', storage: '128GB / 256GB / 512GB / 1TB', display: '6.3인치 Super Retina XDR OLED', camera: '전면: 1200만\\n후면: 4800만+4800만+1200만', battery: '3582mAh', weight: '199g' },
    { model: 'IP16-PL', cpu: 'Apple A18', ram: '8GB', storage: '128GB / 256GB / 512GB', display: '6.7인치 Super Retina XDR OLED', camera: '전면: 1200만\\n후면: 4800만+1200만', battery: '4674mAh', weight: '199g' },
    { model: 'IP16', cpu: 'Apple A18', ram: '8GB', storage: '128GB / 256GB / 512GB', display: '6.1인치 Super Retina XDR OLED', camera: '전면: 1200만\\n후면: 4800만+1200만', battery: '3561mAh', weight: '170g' },
    { model: 'IP15-PM', cpu: 'Apple A17 Pro', ram: '8GB', storage: '256GB / 512GB / 1TB', display: '6.7인치 Super Retina XDR OLED', camera: '전면: 1200만\\n후면: 4800만+1200만+1200만', battery: '4422mAh', weight: '221g' },
    { model: 'IP15-P', cpu: 'Apple A17 Pro', ram: '8GB', storage: '128GB / 256GB / 512GB / 1TB', display: '6.1인치 Super Retina XDR OLED', camera: '전면: 1200만\\n후면: 4800만+1200만+1200만', battery: '3274mAh', weight: '187g' }
  ];

  await conn.query('DELETE FROM device_specs');

  const [devices] = await conn.query('SELECT id, modelName FROM devices');
  
  for (const device of devices) {
    const spec = specsData.find(s => s.model === device.modelName);
    if (spec) {
      const id = crypto.randomUUID();
      await conn.query(
        'INSERT INTO device_specs (id, device_id, cpu, ram, storage, display, camera, battery, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, device.id, spec.cpu, spec.ram, spec.storage, spec.display, spec.camera, spec.battery, spec.weight]
      );
    }
  }

  console.log('Seeded device_specs table successfully!');
  await conn.end();
}

seedSpecs().catch(console.error);
