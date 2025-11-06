// routes/fornecedoresRoutes.js
const express = require('express');
const router = express.Router();

// 1. Importe o novo controller
const fornecedorController = require('../controllers/fornecedorController');

// 2. Mapeie as rotas para as funções do controller
//    (Seguindo o mesmo padrão do despesasRoutes.js)

// GET /fornecedores (Lista)
router.get('/', fornecedorController.index);

// GET /fornecedores/new (Formulário de criar)
router.get('/new', fornecedorController.new);

// POST /fornecedores (Ação de criar)
router.post('/', fornecedorController.create);

// GET /fornecedores/:id/edit (Formulário de editar)
router.get('/:id/edit', fornecedorController.edit);

// POST /fornecedores/:id (Ação de atualizar)
router.post('/:id', fornecedorController.update);

// POST /fornecedores/:id/delete (Ação de deletar)
router.post('/:id/delete', fornecedorController.destroy);

// GET /fornecedores/:id (Mostrar detalhes)
router.get('/:id', fornecedorController.show);

module.exports = router;