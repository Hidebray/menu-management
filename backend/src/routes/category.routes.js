const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

router.post('/', categoryController.create);
router.get('/', categoryController.list);
router.put('/:id', categoryController.update);
router.delete('/:id', categoryController.remove);

module.exports = router;