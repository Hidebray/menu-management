const express = require('express');
const router = express.Router();
const modifierController = require('../controllers/modifier.controller');

// 1. Tạo nhóm modifier
router.post('/groups', modifierController.createGroup);

// 2. Thêm option vào nhóm (VD: /groups/UUID_NHÓM/options)
router.post('/groups/:groupId/options', modifierController.addOption);

// 3. Gắn nhóm vào món ăn (VD: /items/UUID_MÓN/modifiers)
router.post('/items/:itemId/modifiers', modifierController.attachToItem);

module.exports = router;