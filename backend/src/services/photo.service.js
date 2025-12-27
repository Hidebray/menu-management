const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

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

    for (const file of files) {
      // Ensure this path matches how your server serves static files
      const photoUrl = `/uploads/${file.filename}`;
      
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

// --- DELETE PHOTO ---
const deletePhoto = async (photoId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get photo info to delete file from disk
    const res = await client.query('SELECT * FROM menu_item_photos WHERE id = $1', [photoId]);
    if (res.rows.length === 0) throw new Error('Photo not found');
    const photo = res.rows[0];

    // 2. Delete record from DB
    await client.query('DELETE FROM menu_item_photos WHERE id = $1', [photoId]);

    // 3. Delete file from disk
    // Adjust logic if your URL structure is different
    const filename = photo.url.split('/uploads/')[1];
    if (filename) {
        // Go up two levels from 'src/services' to reach root, then into 'uploads'
        const filePath = path.join(__dirname, '../../uploads', filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    await client.query('COMMIT');
    return true;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

// --- SET PRIMARY PHOTO ---
const setPrimaryPhoto = async (photoId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Find the menu_item_id for this photo
    const res = await client.query('SELECT menu_item_id FROM menu_item_photos WHERE id = $1', [photoId]);
    if (res.rows.length === 0) throw new Error('Photo not found');
    const { menu_item_id } = res.rows[0];

    // 2. Reset all photos of this item to false
    await client.query(
      'UPDATE menu_item_photos SET is_primary = FALSE WHERE menu_item_id = $1',
      [menu_item_id]
    );

    // 3. Set this photo to true
    const updateRes = await client.query(
      'UPDATE menu_item_photos SET is_primary = TRUE WHERE id = $1 RETURNING *',
      [photoId]
    );

    await client.query('COMMIT');
    return updateRes.rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

module.exports = { addPhotos, deletePhoto, setPrimaryPhoto };