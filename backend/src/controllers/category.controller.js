const categoryService = require('../services/category.service');
const { z } = require('zod');

// Schema validate đầu vào
const createCategorySchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().optional(),
  display_order: z.number().int().nonnegative().optional(),
  // Tạm thời nhận restaurant_id từ body để test
  restaurant_id: z.string().uuid()
});

const create = async (req, res) => {
  try {
    // 1. Validate dữ liệu
    const validatedData = createCategorySchema.parse(req.body);
    const { restaurant_id, ...categoryData } = validatedData;

    // 2. Gọi service
    const newCategory = await categoryService.createCategory(restaurant_id, categoryData);

    // 3. Trả về kết quả
    res.status(201).json({
      success: true,
      data: newCategory
    });
  } catch (error) {
    // Xử lý lỗi validation hoặc lỗi logic
    res.status(400).json({
      success: false,
      message: error.message || 'Invalid input'
    });
  }
};

const list = async (req, res) => {
  try {
    // Tạm lấy restaurant_id từ query param (?restaurant_id=...) để test
    const { restaurant_id } = req.query;
    if (!restaurant_id) throw new Error('Missing restaurant_id');

    const categories = await categoryService.getCategories(restaurant_id);
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    // Tạm lấy restaurant_id từ body (hoặc sau này từ token)
    const { restaurant_id, ...updateData } = req.body; 

    // Validate cơ bản (bạn có thể dùng zod parse kỹ hơn)
    if (!restaurant_id) throw new Error('Missing restaurant_id');

    const updatedCat = await categoryService.updateCategory(id, restaurant_id, updateData);
    
    if (!updatedCat) return res.status(404).json({ success: false, message: 'Category not found' });

    res.json({ success: true, data: updatedCat });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    // Lấy restaurant_id từ query hoặc body để bảo mật
    const { restaurant_id } = req.body.restaurant_id ? req.body : req.query; 

    if (!restaurant_id) throw new Error('Missing restaurant_id');

    const deleted = await categoryService.deleteCategory(id, restaurant_id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Category not found' });

    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  create,
  list,
  update,
  remove
};