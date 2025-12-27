const express = require('express');
const router = express.Router();
const modifierController = require('../controllers/modifier.controller');

// 1. Get all groups (NEW)
router.get('/groups', modifierController.listGroups);

// 2. Create group
router.post('/groups', modifierController.createGroup);

// 3. Add option
router.post('/groups/:groupId/options', modifierController.addOption);

// 4. Attach to item
router.post('/items/:itemId/modifiers', modifierController.attachToItem);

module.exports = router;