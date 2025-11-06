// routes/clientesRoutes.js
const express = require('express');
const router = express.Router();

// 1. Importe o novo controller
const clienteController = require('../controllers/clienteController');

// 2. Mapeie as rotas para as funções do controller

// GET /clientes (Lista)
router.get('/', clienteController.index);

// GET /clientes/new (Formulário de criar)
router.get('/new', clienteController.new);

// POST /clientes (Ação de criar)
router.post('/', clienteController.create);

// GET /clientes/:id/edit (Formulário de editar)
router.get('/:id/edit', clienteController.edit);

// POST /clientes/:id (Ação de atualizar)
router.post('/:id', clienteController.update);

// POST /clientes/:id/delete (Ação de deletar)
router.post('/:id/delete', clienteController.destroy);

// GET /clientes/:id (Mostrar detalhes)
router.get('/:id', clienteController.show);

module.exports = router;