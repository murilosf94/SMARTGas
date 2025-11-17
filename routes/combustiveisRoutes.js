// routes/combustiveisRoutes.js
const express = require('express');
const router = express.Router();
const combustivelController = require('../controllers/combustivelController');
const { estaLogado, eAdmin } = require('../middleware/authmiddleware');

// Esta rota é SÓ PARA ADMINS
router.use(estaLogado, eAdmin);

// GET /combustiveis (Ver a lista de combustíveis)
router.get('/', combustivelController.index);

// POST /combustiveis/:id (Atualizar preço ou adicionar estoque)
router.post('/:id/update', combustivelController.update);

module.exports = router;