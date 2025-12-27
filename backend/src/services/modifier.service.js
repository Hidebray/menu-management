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

// 4. Cập nhật thông tin nhóm modifier
const updateGroup = async (id, restaurantId, data) => {
  const { name, selection_type, is_required, min_selections, max_selections } = data;
  const query = `
    UPDATE modifier_groups
    SET name = $1, selection_type = $2, is_required = $3, 
        min_selections = $4, max_selections = $5, updated_at = NOW()
    WHERE id = $6 AND restaurant_id = $7
    RETURNING *;
  `;
  const values = [name, selection_type, is_required || false, min_selections || 0, max_selections || 0, id, restaurantId];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// 5. Xóa nhóm modifier (Xóa sạch các ràng buộc)
const deleteGroup = async (id, restaurantId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Bắt đầu transaction

    // B1: Xóa liên kết với các món ăn trước
    await client.query('DELETE FROM menu_item_modifier_groups WHERE group_id = $1', [id]);
    
    // B2: Xóa các options thuộc nhóm này
    await client.query('DELETE FROM modifier_options WHERE group_id = $1', [id]);

    // B3: Cuối cùng xóa nhóm (phải đúng restaurant_id)
    const res = await client.query('DELETE FROM modifier_groups WHERE id = $1 AND restaurant_id = $2 RETURNING *', [id, restaurantId]);
    
    await client.query('COMMIT'); // Lưu thay đổi
    return res.rows[0];
  } catch (e) {
    await client.query('ROLLBACK'); // Hoàn tác nếu lỗi
    throw e;
  } finally {
    client.release();
  }
};

// 6. Xóa một option lẻ
const deleteOption = async (id) => {
    const query = 'DELETE FROM modifier_options WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

module.exports = { 
    createGroup, createOption, attachGroupToItem, updateGroup, deleteGroup, deleteOption 
};