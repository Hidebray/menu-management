const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const upload = require('../middlewares/upload');

router.post('/', menuController.create);
router.get('/', menuController.list);
router.get('/:id', menuController.getOne);
router.delete('/:id', menuController.remove);
router.put('/:id', menuController.update);
router.post('/:id/photos', upload.array('photos', 5), menuController.uploadPhotos);
router.delete('/:id/modifiers/:groupId', menuController.removeModifier);

module.exports = router;