// routes/manutencaoRoutes.js
const express = require('express');
const router = express.Router();
const manutencaoController = require('../controllers/manutencaoController');
const { estaLogado, eAdmin } = require('../middleware/authmiddleware');

// Esta rota é SÓ PARA ADMINS
router.use(estaLogado, eAdmin);

// GET /manutencao (A lista de alertas pendentes)
router.get('/', manutencaoController.listarAlertas);

// POST /manutencao/:id_ordem/combustivel/:id_combustivel/completar (Resetar)
router.post('/:id_ordem/combustivel/:id_combustivel/completar', manutencaoController.completarManutencao);

module.exports = router;