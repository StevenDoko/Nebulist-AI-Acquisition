const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Generate UUID v4
function generateUUID() {
  return crypto.randomUUID();
}

// 3 admin users baru
const newAdmins = [
  {
    username: 'admin2',
    password: 'Nebulist2024!',
    full_name: 'Administrator 2'
  },
  {
    username: 'admin3',
    password: 'Nebulist2024!',
    full_name: 'Administrator 3'
  },
  {
    username: 'admin4',
    password: 'Nebulist2024!',
    full_name: 'Administrator 4'
  }
];

async function generateInsertQuery() {
  console.log('-- ========================================');
  console.log('-- INSERT Query untuk 3 Admin Tambahan');
  console.log('-- Role: admin (semua bisa bekerja bersamaan)');
  console.log('-- ========================================\n');
  
  const values = [];
  const userDetails = [];
  
  for (const admin of newAdmins) {
    const id = generateUUID();
    const passwordHash = await bcrypt.hash(admin.password, 10);
    const now = new Date().toISOString();
    
    values.push(`  ('${id}', '${admin.username}', '${passwordHash}', '${admin.full_name}', TRUE, '${now}', '${now}')`);
    
    userDetails.push({
      username: admin.username,
      password: admin.password,
      id: id
    });
  }
  
  console.log('INSERT INTO auth_users (id, username, password_hash, full_name, is_active, created_at, updated_at)');
  console.log('VALUES');
  console.log(values.join(',\n') + ';\n');
  
  console.log('\n-- ========================================');
  console.log('-- KREDENSIAL LOGIN (4 Admin Total)');
  console.log('-- ========================================');
  console.log('-- 1. Username: admin          | Password: Nebulist2024! (sudah ada)');
  userDetails.forEach((user, i) => {
    console.log(`-- ${i + 2}. Username: ${user.username.padEnd(14)} | Password: ${user.password}`);
  });
  console.log('\n-- Semua admin bisa login dan bekerja bersamaan seperti Canva workbench');
  console.log('-- ========================================\n');
}

generateInsertQuery().catch(console.error);
