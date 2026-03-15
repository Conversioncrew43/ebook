const express = require('express');
const router = express.Router();
const leadsController = require('../controler/leadscontroller');

router.post('/', leadsController.create);
router.get('/', leadsController.list);
router.get('/:id', leadsController.get);
router.put('/:id', leadsController.update);
router.delete('/:id', leadsController.delete);

module.exports = router;