const guestService = require('../services/guest.service');

const getMenu = async (req, res) => {
  try {
    // Với API khách, thường restaurant_id sẽ nằm trong query hoặc lấy từ subdomain
    // Ở đây ta test bằng query param
    const { restaurant_id } = req.query;
    if (!restaurant_id) throw new Error('Missing restaurant_id');

    const menu = await guestService.getFullMenu(restaurant_id);
    res.json({ success: true, data: menu });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await guestService.getItemDetail(id);
    
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getMenu, getItem };