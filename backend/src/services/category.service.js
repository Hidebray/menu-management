const pool = require('../config/db');

const createCategory = async (restaurantId, data) => {
  const { name, description, display_order } = data;
  
  // Kiểm tra trùng tên trong cùng nhà hàng
  const existing = await pool.query(
    'SELECT id FROM menu_categories WHERE restaurant_id = $1 AND name = $2',
    [restaurantId, name]
  );
  if (existing.rows.length > 0) {
    throw new Error('Category name already exists');
  }

  const query = `
    INSERT INTO menu_categories (restaurant_id, name, description, display_order)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [restaurantId, name, description, display_order || 0];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getCategories = async (restaurantId) => {
  const query = `
    SELECT * FROM menu_categories 
    WHERE restaurant_id = $1 
    ORDER BY display_order ASC, created_at DESC;
  `;
  const result = await pool.query(query, [restaurantId]);
  return result.rows;
};

const updateCategory = async (id, restaurantId, data) => {
  const { name, description, display_order, status } = data;

  const query = `
    UPDATE menu_categories
    SET name = $1, description = $2, display_order = $3, status = $4, updated_at = NOW()
    WHERE id = $5 AND restaurant_id = $6
    RETURNING *;
  `;
  const values = [name, description, display_order, status, id, restaurantId];
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteCategory = async (id, restaurantId) => {
    const query = `
      UPDATE menu_categories 
      SET status = 'inactive', updated_at = NOW()
      WHERE id = $1 AND restaurant_id = $2
      RETURNING id, name, status;
    `;
    const result = await pool.query(query, [id, restaurantId]);
    return result.rows[0];
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
};