// routes/despesas.js (O CÓDIGO CORRETO)
const express = require('express');
const router = express.Router();

// 1. Importe o controller! (Isso estava faltando)
const despesaController = require('../controllers/despesaController');

// 2. Mapeie as rotas para as funções do controller

// GET /despesas (Lista)
// Esta rota AGORA chama a função 'index' do controller,
// que busca no banco e passa a variável 'despesas' para o Jade.
router.get('/', despesaController.index);

// GET /despesas/new (Formulário de criar)
router.get('/new', despesaController.new);

// POST /despesas (Ação de criar)
router.post('/', despesaController.create);

// GET /despesas/:id/edit (Formulário de editar)
router.get('/:id/edit', despesaController.edit);

// POST /despesas/:id (Ação de atualizar)
router.post('/:id', despesaController.update);

// POST /despesas/:id/delete (Ação de deletar)
router.post('/:id/delete', despesaController.destroy);

// GET /despesas/:id (Mostrar detalhes - opcional, se você tiver)
router.get('/:id', despesaController.show);

module.exports = router;