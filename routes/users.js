const express = require('express');
const router = express.Router();
const usersController = require('../controler/userscontroller');

router.post('/', usersController.create);
router.get('/', usersController.list);
router.get('/:id', usersController.get);
router.put('/:id', usersController.update);
router.delete('/:id', usersController.delete);

module.exports = router;