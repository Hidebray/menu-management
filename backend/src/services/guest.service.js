const pool = require('../config/db');

const getFullMenu = async (restaurantId) => {
  // 1. Lấy danh sách danh mục đang Active
  const catQuery = `
    SELECT id, name, description 
    FROM menu_categories 
    WHERE restaurant_id = $1 AND status = 'active'
    ORDER BY display_order ASC;
  `;
  const categories = await pool.query(catQuery, [restaurantId]);

  // 2. Lấy danh sách món ăn đang Active (hoặc Sold out vẫn hiện để khách biết)
  // Kèm theo ảnh đại diện (primary photo)
  const itemQuery = `
    SELECT 
      m.id, m.category_id, m.name, m.description, m.price, 
      m.status, m.is_chef_recommended,
      p.url as image_url
    FROM menu_items m
    LEFT JOIN menu_item_photos p ON m.id = p.menu_item_id AND p.is_primary = TRUE
    JOIN menu_categories c ON m.category_id = c.id
    WHERE m.restaurant_id = $1 
      AND m.is_deleted = FALSE 
      AND m.status IN ('available', 'sold_out')
      AND c.status = 'active'
    ORDER BY m.created_at DESC;
  `;
  const items = await pool.query(itemQuery, [restaurantId]);

  // 3. Ghép món ăn vào danh mục tương ứng
  const result = categories.rows.map(cat => {
    return {
      ...cat,
      items: items.rows.filter(item => item.category_id === cat.id)
    };
  });

  // Chỉ trả về danh mục nào có món ăn (tùy chọn, ở đây mình giữ cả danh mục rỗng)
  return result;
};

// Lấy chi tiết một món (khi khách bấm vào xem để chọn Size/Option)
const getItemDetail = async (itemId) => {
  // Lấy thông tin món
  const itemQuery = `
    SELECT * FROM menu_items WHERE id = $1 AND is_deleted = FALSE
  `;
  const itemRes = await pool.query(itemQuery, [itemId]);
  if (itemRes.rows.length === 0) return null;
  const item = itemRes.rows[0];

  // Lấy tất cả ảnh
  const photoQuery = `SELECT url, is_primary FROM menu_item_photos WHERE menu_item_id = $1`;
  const photoRes = await pool.query(photoQuery, [itemId]);
  item.photos = photoRes.rows;

  // Lấy các nhóm Modifier và Option
  const modQuery = `
    SELECT 
      g.id as group_id, g.name as group_name, g.selection_type, 
      g.min_selections, g.max_selections, g.is_required,
      o.id as option_id, o.name as option_name, o.price_adjustment
    FROM menu_item_modifier_groups mg
    JOIN modifier_groups g ON mg.group_id = g.id
    JOIN modifier_options o ON g.id = o.group_id
    WHERE mg.menu_item_id = $1 AND g.status = 'active' AND o.status = 'active'
    ORDER BY g.display_order, o.price_adjustment;
  `;
  const modRes = await pool.query(modQuery, [itemId]);

  // Gom nhóm Modifier (vì query trên trả về dạng phẳng flat rows)
  const groupsMap = {};
  modRes.rows.forEach(row => {
    if (!groupsMap[row.group_id]) {
      groupsMap[row.group_id] = {
        id: row.group_id,
        name: row.group_name,
        type: row.selection_type,
        required: row.is_required,
        min: row.min_selections,
        max: row.max_selections,
        options: []
      };
    }
    groupsMap[row.group_id].options.push({
      id: row.option_id,
      name: row.option_name,
      price: row.price_adjustment
    });
  });
  
  item.modifier_groups = Object.values(groupsMap);
  
  return item;
};

module.exports = { getFullMenu, getItemDetail };