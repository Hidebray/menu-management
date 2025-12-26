const pool = require('../config/db');

// 1. Tạo Nhóm Modifier (VD: Size, Topping)
const createGroup = async (restaurantId, data) => {
  const { name, selection_type, is_required, min_selections, max_selections } = data;
  
  const query = `
    INSERT INTO modifier_groups (restaurant_id, name, selection_type, is_required, min_selections, max_selections)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [restaurantId, name, selection_type, is_required || false, min_selections || 0, max_selections || 0];
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

// 2. Tạo Option cho Nhóm (VD: Size L - thêm 5k)
const createOption = async (groupId, data) => {
  const { name, price_adjustment } = data;
  
  const query = `
    INSERT INTO modifier_options (group_id, name, price_adjustment)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [groupId, name, price_adjustment || 0];
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

// 3. Gắn Nhóm vào Món ăn
const attachGroupToItem = async (menuItemId, groupId) => {
  const query = `
    INSERT INTO menu_item_modifier_groups (menu_item_id, group_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING -- Nếu gắn rồi thì bỏ qua
    RETURNING *;
  `;
  const result = await pool.query(query, [menuItemId, groupId]);
  return result.rows[0];
};

module.exports = { createGroup, createOption, attachGroupToItem };