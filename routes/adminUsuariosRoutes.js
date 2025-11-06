// routes/adminUsuariosRoutes.js
const express = require('express');
const router = express.Router();

// 1. Importe o novo controller
const adminUsuarioController = require('../controllers/adminUsuarioController');

// 2. Mapeie as rotas

// GET /admin-usuarios/ (A lista de usuários)
router.get('/', adminUsuarioController.index);

// GET /admin-usuarios/:id/edit (Página para editar a função)
router.get('/:id/edit', adminUsuarioController.edit);

// POST /admin-usuarios/:id (Ação de salvar a função)
router.post('/:id', adminUsuarioController.update);

module.exports = router;