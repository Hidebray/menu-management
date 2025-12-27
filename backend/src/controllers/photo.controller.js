const photoService = require('../services/photo.service');

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await photoService.deletePhoto(id);
    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const setPrimary = async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await photoService.setPrimaryPhoto(id);
    res.json({ success: true, data: photo });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { remove, setPrimary };