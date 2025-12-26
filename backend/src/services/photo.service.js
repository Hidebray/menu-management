const pool = require('../config/db');

const addPhotos = async (menuItemId, files) => {
  if (!files || files.length === 0) return [];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const insertedPhotos = [];
    const query = `
      INSERT INTO menu_item_photos (menu_item_id, url, is_primary)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    // Duyệt qua từng file đã upload để lưu vào DB
    for (const file of files) {
      // Tạo đường dẫn URL (giả sử server chạy localhost:3000)
      const photoUrl = `/uploads/${file.filename}`;
      
      // Mặc định ảnh đầu tiên không là primary (hoặc logic tùy bạn)
      // Ở đây mình để false hết, lát viết API set primary riêng
      const res = await client.query(query, [menuItemId, photoUrl, false]);
      insertedPhotos.push(res.rows[0]);
    }

    await client.query('COMMIT');
    return insertedPhotos;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

module.exports = { addPhotos };