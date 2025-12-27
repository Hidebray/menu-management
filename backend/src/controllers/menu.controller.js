const menuService = require('../services/menu.service');
const { z } = require('zod');
const photoService = require('../services/photo.service');

// Schema Validate
const createItemSchema = z.object({
  name: z.string().min(2).max(80),
  category_id: z.string().uuid(),
  price: z.number().positive(),
  description: z.string().optional(),
  prep_time_minutes: z.number().int().min(0).max(240).optional(),
  status: z.enum(['available', 'unavailable', 'sold_out']),
  is_chef_recommended: z.boolean().optional(),
  restaurant_id: z.string().uuid() // Tạm thời gửi từ body để test
});

const create = async (req, res) => {
  try {
    const validatedData = createItemSchema.parse(req.body);
    const { restaurant_id, ...itemData } = validatedData;
    
    const newItem = await menuService.createItem(restaurant_id, itemData);
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const list = async (req, res) => {
  try {
    const { restaurant_id, page, limit, search, category_id, status, sort_by, sort_order } = req.query;
    if (!restaurant_id) throw new Error('Missing restaurant_id');

    const items = await menuService.getItems(restaurant_id, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
      category_id,
      status,
      sort_by,
      sort_order
    });

    res.json({ success: true, data: items });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const { restaurant_id } = req.body; // Tạm thời lấy từ body
    const deleted = await menuService.deleteItem(id, restaurant_id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Item not found' });
    
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadPhotos = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID món ăn
    const files = req.files;   // Multer sẽ gắn file vào đây

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const photos = await photoService.addPhotos(id, files);
    res.json({ success: true, data: photos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = createItemSchema.parse(req.body);
    const { restaurant_id, ...itemData } = validatedData;

    const updatedItem = await menuService.updateItem(id, restaurant_id, itemData);
    
    if (!updatedItem) {
      return res.status(404).json({ success: false, message: 'Item not found or permission denied' });
    }

    res.json({ success: true, data: updatedItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await menuService.getItemDetail(id);
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { create, list, remove, uploadPhotos, update, getOne };