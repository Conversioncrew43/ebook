const express = require('express');
const router = express.Router();
const expensesController = require('../controler/expensescontroller');

router.post('/', expensesController.create);
router.get('/', expensesController.list);
router.get('/:id', expensesController.get);
router.put('/:id', expensesController.update);
router.patch('/:id', expensesController.update);
router.delete('/:id', expensesController.delete);

module.exports = router;