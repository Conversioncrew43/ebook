const express = require('express');
const router = express.Router();
const paymentsController = require('../controler/paymentscontroller');

router.post('/', paymentsController.create);
router.get('/', paymentsController.list);
router.get('/:id', paymentsController.get);
router.put('/:id', paymentsController.update);
router.patch('/:id', paymentsController.update);
router.delete('/:id', paymentsController.delete);

module.exports = router;