-- Create admin user
INSERT INTO users (nickname, email, password_hash, role) VALUES 
('admin', 'admin@skoropad.com', '5d41402abc4b2a76b9719d911017c592', 'admin'); -- password: hello

-- Create some sample categories and advertisements
INSERT INTO advertisements (user_id, title, description, price, category, subcategory, images, status, location, condition) 
SELECT 
    (SELECT id FROM users WHERE nickname = 'admin'),
    'iPhone 15 Pro Max',
    'Новий iPhone 15 Pro Max 256GB в ідеальному стані. Куплений місяць тому, всі документи є.',
    45000,
    'electronics',
    'phones',
    ARRAY['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400'],
    'active',
    'Київ',
    'new'
WHERE NOT EXISTS (SELECT 1 FROM advertisements WHERE title = 'iPhone 15 Pro Max');

INSERT INTO advertisements (user_id, title, description, price, category, subcategory, images, status, location, condition) 
SELECT 
    (SELECT id FROM users WHERE nickname = 'admin'),
    'MacBook Pro M3',
    'MacBook Pro 14" з чіпом M3, 16GB RAM, 512GB SSD. Використовувався для роботи, стан відмінний.',
    85000,
    'electronics',
    'laptops',
    ARRAY['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400'],
    'active',
    'Львів',
    'used'
WHERE NOT EXISTS (SELECT 1 FROM advertisements WHERE title = 'MacBook Pro M3');

INSERT INTO advertisements (user_id, title, description, price, category, subcategory, images, status, location, condition) 
SELECT 
    (SELECT id FROM users WHERE nickname = 'admin'),
    'BMW X5 2020',
    'BMW X5 xDrive40i 2020 року, пробіг 45000 км. Повна комплектація, один власник.',
    1200000,
    'automobiles',
    'sale',
    ARRAY['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400'],
    'active',
    'Одеса',
    'used'
WHERE NOT EXISTS (SELECT 1 FROM advertisements WHERE title = 'BMW X5 2020');
