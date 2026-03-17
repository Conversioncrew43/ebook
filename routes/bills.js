const express = require('express');
const router = express.Router();
const billsController = require('../controler/billscontroller');

router.post('/', billsController.create);
router.get('/', billsController.list);
router.get('/:id', billsController.get);
router.put('/:id', billsController.update);
router.patch('/:id', billsController.update);
router.delete('/:id', billsController.delete);

module.exports = router;