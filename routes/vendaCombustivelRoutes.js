// routes/vendaCombustivelRoutes.js
const express = require('express');
const router = express.Router();
const vendaCombustivelController = require('../controllers/vendaCombustivelController');
const { estaLogado } = require('../middleware/authmiddleware');
const { precisaDeTurnoAberto } = require('../middleware/turnoMiddleware');

// Esta rota é para FRENTISTAS (logados e com turno aberto) E ADMINS
router.use(estaLogado, precisaDeTurnoAberto);

// GET /venda-combustivel (A tela de venda)
router.get('/', vendaCombustivelController.mostrarTelaVenda);

// POST /venda-combustivel (Registrar a venda)
router.post('/', vendaCombustivelController.registrarVenda);

module.exports = router;