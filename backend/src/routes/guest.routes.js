const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guest.controller');

// GET /api/menu?restaurant_id=... (Lấy toàn bộ menu)
router.get('/', guestController.getMenu);

// GET /api/menu/items/:id (Lấy chi tiết món để chọn size)
router.get('/items/:id', guestController.getItem);

module.exports = router;