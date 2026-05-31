-- Insert admin2 and admin3 users
-- Password: admin345
-- Bcrypt hash: $2b$10$9wD3O1z/h8ejDH3pV54B7e8Gm4Qs6oWHH/V4pGeAg5N90T2b618Ym

INSERT INTO auth_users (username, password_hash, full_name, email, role, is_active)
VALUES 
  ('admin2', '$2b$10$9wD3O1z/h8ejDH3pV54B7e8Gm4Qs6oWHH/V4pGeAg5N90T2b618Ym', 'Administrator 2', 'admin2@nebulist.local', 'admin', true),
  ('admin3', '$2b$10$9wD3O1z/h8ejDH3pV54B7e8Gm4Qs6oWHH/V4pGeAg5N90T2b618Ym', 'Administrator 3', 'admin3@nebulist.local', 'admin', true);

-- Verify the insert
SELECT username, email, role, is_active, created_at 
FROM auth_users 
WHERE username IN ('admin2', 'admin3');
