const pool = require('../config/db');

// 1. Tạo món mới
const createItem = async (restaurantId, data) => {
  const { 
    name, category_id, price, description, 
    prep_time_minutes, status, is_chef_recommended 
  } = data;

  const query = `
    INSERT INTO menu_items (
      restaurant_id, category_id, name, price, description, 
      prep_time_minutes, status, is_chef_recommended
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;
  
  const values = [
    restaurantId, category_id, name, price, description, 
    prep_time_minutes || 0, status, is_chef_recommended || false
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// 2. Lấy danh sách (có Lọc, Sắp xếp, Phân trang)
const getItems = async (restaurantId, filters) => {
  const { 
    search, category_id, status, 
    sort_by, sort_order = 'asc', 
    page = 1, limit = 10 
  } = filters;

  // Xây dựng câu query động
  let query = `
    SELECT m.*, c.name as category_name 
    FROM menu_items m
    JOIN menu_categories c ON m.category_id = c.id
    WHERE m.restaurant_id = $1 AND m.is_deleted = FALSE
  `;
  let paramIndex = 2; // $1 đã là restaurant_id
  const values = [restaurantId];

  // Thêm điều kiện lọc nếu có
  if (search) {
    query += ` AND m.name ILIKE $${paramIndex}`; // ILIKE để tìm không phân biệt hoa thường
    values.push(`%${search}%`);
    paramIndex++;
  }

  if (category_id) {
    query += ` AND m.category_id = $${paramIndex}`;
    values.push(category_id);
    paramIndex++;
  }

  if (status) {
    query += ` AND m.status = $${paramIndex}`;
    values.push(status);
    paramIndex++;
  }

  // Xử lý sắp xếp (chỉ cho phép các trường an toàn)
  const validSortFields = ['price', 'created_at', 'name'];
  const sortField = validSortFields.includes(sort_by) ? `m.${sort_by}` : 'm.created_at';
  const order = sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  
  query += ` ORDER BY ${sortField} ${order}`;

  // Xử lý phân trang
  const offset = (page - 1) * limit;
  query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  values.push(limit, offset);

  // Thực thi
  const result = await pool.query(query, values);
  
  // Đếm tổng số lượng (để frontend biết có bao nhiêu trang)
  // Lưu ý: Query đếm này nên tương tự query chính nhưng bỏ LIMIT/OFFSET
  // Ở đây mình làm đơn giản trả về data trước.
  
  return result.rows;
};

// 3. Cập nhật món
const updateItem = async (id, restaurantId, data) => {
  const { 
    name, category_id, price, description, 
    prep_time_minutes, status, is_chef_recommended 
  } = data;

  const query = `
    UPDATE menu_items 
    SET 
      name = $1, 
      category_id = $2, 
      price = $3, 
      description = $4, 
      prep_time_minutes = $5, 
      status = $6, 
      is_chef_recommended = $7,
      updated_at = NOW()
    WHERE id = $8 AND restaurant_id = $9
    RETURNING *;
  `;

  const values = [
    name, category_id, price, description, 
    prep_time_minutes, status, is_chef_recommended, 
    id, restaurantId
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// 4. Xóa mềm (Soft Delete)
const deleteItem = async (id, restaurantId) => {
  const query = `
    UPDATE menu_items 
    SET is_deleted = TRUE, updated_at = NOW()
    WHERE id = $1 AND restaurant_id = $2
    RETURNING id;
  `;
  const result = await pool.query(query, [id, restaurantId]);
  return result.rows[0];
};

module.exports = { createItem, getItems, updateItem, deleteItem };