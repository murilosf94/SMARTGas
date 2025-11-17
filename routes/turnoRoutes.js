// routes/turnoRoutes.js
const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turnoController');
// 1. IMPORTAMOS O 'eAdmin' (e o estaLogado)
const { estaLogado, eAdmin } = require('../middleware/authmiddleware');

// 2. O 'estaLogado' protege TODAS as rotas de turno
router.use(estaLogado);

// Rota "inteligente" (que fizemos antes)
router.get('/', (req, res) => {
  if (req.session.turno_id) {
    res.redirect('/turno/fechar');
  } else {
    res.redirect('/turno/abrir');
  }
});

// Rotas de Abrir e Fechar (para Frentistas)
router.get('/abrir', turnoController.mostrarFormAbrir);
router.post('/abrir', turnoController.abrirTurno);
router.get('/fechar', turnoController.mostrarFormFechar);
router.post('/fechar', turnoController.fecharTurno);


// --- [NOVA ROTA] ---
// Rota para o Admin ver o histórico (Protegida pelo 'eAdmin')
router.get('/historico', eAdmin, turnoController.listarTurnos);

module.exports = router;