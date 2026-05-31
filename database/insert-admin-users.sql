-- ========================================
-- INSERT 3 Admin Tambahan untuk Nebulist
-- ========================================
-- Dibuat: 2026-05-31
-- Total Admin: 4 (1 existing + 3 new)
-- Semua admin bisa login dan bekerja bersamaan seperti Canva workbench
-- ========================================

INSERT INTO auth_users (id, username, password_hash, full_name, is_active, created_at, updated_at)
VALUES
  ('41ac0434-936d-48ed-8aa2-5557a3b9a888', 'admin2', '$2b$10$Hs2janA36KHM3Gb4iRhyPelR1GKlUWFXLIALEUqdsDvDxgzPyvyBa', 'Administrator 2', TRUE, '2026-05-31T03:23:27.223Z', '2026-05-31T03:23:27.223Z'),
  ('68d79988-4992-477c-b886-fdc8d4599f45', 'admin3', '$2b$10$y02Vn1Ava25wSFAn.EjIheTocXPYA2kobowGpk9n0LjP4/IaT/UNu', 'Administrator 3', TRUE, '2026-05-31T03:23:27.296Z', '2026-05-31T03:23:27.296Z'),
  ('cdbcf5b2-6378-4121-854a-14311a571717', 'admin4', '$2b$10$7npS1VrtRZ/4BaS0Oeo7ZOfAiIRMhm4jpodvclFklMcAA8/.WrBoe', 'Administrator 4', TRUE, '2026-05-31T03:23:27.360Z', '2026-05-31T03:23:27.360Z');

-- ========================================
-- KREDENSIAL LOGIN (4 Admin Total)
-- ========================================
-- 1. Username: admin          | Password: Nebulist2024! (sudah ada di database)
-- 2. Username: admin2         | Password: Nebulist2024!
-- 3. Username: admin3         | Password: Nebulist2024!
-- 4. Username: admin4         | Password: Nebulist2024!
-- ========================================

-- CARA PENGGUNAAN:
-- 1. Buka Supabase Dashboard > SQL Editor
-- 2. Copy-paste query di atas
-- 3. Klik "Run" untuk execute
-- 4. Semua 4 admin bisa login bersamaan dan bekerja kolaboratif

-- FITUR KOLABORASI:
-- ✓ Multi-user login bersamaan
-- ✓ Real-time collaboration seperti Canva
-- ✓ Semua admin punya akses penuh
-- ✓ Session independent untuk setiap user
