const bcrypt = require('bcryptjs');

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Password harus diisi');
  console.log('\nCara pakai:');
  console.log('  node generate-password-hash.js <password>');
  console.log('\nContoh:');
  console.log('  node generate-password-hash.js admin123');
  process.exit(1);
}

// Generate hash
const hash = bcrypt.hashSync(password, 10);

console.log('\n✅ Password hash berhasil dibuat!\n');
console.log('Password:', password);
console.log('Hash:', hash);
console.log('\nGunakan hash ini di SQL schema atau database Anda.');
console.log('Contoh SQL:');
console.log(`INSERT INTO auth_users (username, password_hash, full_name, is_active)`);
console.log(`VALUES ('admin', '${hash}', 'Administrator', true);`);
console.log('');
