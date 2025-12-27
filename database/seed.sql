-- Dùng ID cố định này cho toàn bộ dữ liệu
-- RESTAURANT_ID: 'c56a4180-65aa-42ec-a945-5fd21dec0538'

-- 1. Tạo Danh mục (Categories)
INSERT INTO menu_categories (id, restaurant_id, name, display_order) VALUES 
('11111111-1111-1111-1111-111111111111', 'c56a4180-65aa-42ec-a945-5fd21dec0538', 'Món Khai Vị', 1),
('22222222-2222-2222-2222-222222222222', 'c56a4180-65aa-42ec-a945-5fd21dec0538', 'Món Chính', 2),
('33333333-3333-3333-3333-333333333333', 'c56a4180-65aa-42ec-a945-5fd21dec0538', 'Đồ Uống', 3)
ON CONFLICT DO NOTHING;

-- 2. Tạo Món ăn (Items)
INSERT INTO menu_items (id, restaurant_id, category_id, name, price, description, status, prep_time_minutes) VALUES
-- Món 1: Phở Bò
('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c56a4180-65aa-42ec-a945-5fd21dec0538', '22222222-2222-2222-2222-222222222222', 'Phở Bò Đặc Biệt', 55000, 'Nước dùng hầm xương 24h', 'available', 15),
-- Món 2: Nem Rán
('bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'c56a4180-65aa-42ec-a945-5fd21dec0538', '11111111-1111-1111-1111-111111111111', 'Nem Rán Hà Nội', 30000, 'Vỏ giòn rụm', 'available', 10),
-- Món 3: Trà Đá
('cccc3333-cccc-cccc-cccc-cccccccccccc', 'c56a4180-65aa-42ec-a945-5fd21dec0538', '33333333-3333-3333-3333-333333333333', 'Trà Đá', 5000, 'Giải khát', 'available', 2)
ON CONFLICT DO NOTHING;

-- 3. Tạo Ảnh món ăn (Photos)
INSERT INTO menu_item_photos (menu_item_id, url, is_primary) VALUES
('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43', TRUE), -- Ảnh Phở
('bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0', TRUE); -- Ảnh Nem Rán

-- 4. Tạo Nhóm Modifier (Groups) -- Đã thay 'g' bằng 'd' và 'e'
INSERT INTO modifier_groups (id, restaurant_id, name, selection_type, is_required) VALUES
('dddd1111-dddd-dddd-dddd-dddddddddddd', 'c56a4180-65aa-42ec-a945-5fd21dec0538', 'Thêm Topping', 'multiple', FALSE),
('eeee2222-eeee-eeee-eeee-eeeeeeeeeeee', 'c56a4180-65aa-42ec-a945-5fd21dec0538', 'Chọn Size', 'single', TRUE)
ON CONFLICT DO NOTHING;

-- 5. Tạo Option cho Modifier
INSERT INTO modifier_options (group_id, name, price_adjustment) VALUES
('dddd1111-dddd-dddd-dddd-dddddddddddd', 'Thêm Quẩy', 5000),
('dddd1111-dddd-dddd-dddd-dddddddddddd', 'Thêm Trứng trần', 10000),
('eeee2222-eeee-eeee-eeee-eeeeeeeeeeee', 'Size Thường', 0),
('eeee2222-eeee-eeee-eeee-eeeeeeeeeeee', 'Size Lớn', 15000);

-- 6. Gắn Modifier vào Món Phở Bò
INSERT INTO menu_item_modifier_groups (menu_item_id, group_id) VALUES
('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dddd1111-dddd-dddd-dddd-dddddddddddd'), -- Phở + Topping
('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'eeee2222-eeee-eeee-eeee-eeeeeeeeeeee')  -- Phở + Size
ON CONFLICT DO NOTHING;