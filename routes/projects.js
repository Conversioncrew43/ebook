const express = require('express');
const router = express.Router();
const projectsController = require('../controler/projectscontroller');

router.post('/', projectsController.create);
router.get('/', projectsController.list);
router.get('/:id', projectsController.get);
router.put('/:id', projectsController.update);
router.delete('/:id', projectsController.delete);

module.exports = router;