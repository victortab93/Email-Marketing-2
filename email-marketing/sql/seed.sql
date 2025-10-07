-- Seed minimal data
INSERT INTO users (id, name, email, role, password_hash)
VALUES (
  gen_random_uuid(),
  'Admin',
  'admin@gmail.com',
  'ADMIN',
  -- password: admin12345 (argon2 hash placeholder; change in production)
  '$argon2id$v=19$m=65536,t=3,p=4$C9tY3Cgwg+vM8Wm5tJxK7w$9k1lE+YcVJ8q6+e8bK5e0B1c0ml9fYwMfrc1ZlQF3gk'
) ON CONFLICT DO NOTHING;
