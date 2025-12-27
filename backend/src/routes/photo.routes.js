const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photo.controller');

// Delete a photo
router.delete('/:id', photoController.remove);

// Set photo as primary
router.put('/:id/primary', photoController.setPrimary);

module.exports = router;