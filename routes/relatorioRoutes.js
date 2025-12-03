const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');
const { estaLogado, eAdmin } = require('../middleware/authmiddleware');

// --- [NOVA ROTA ADICIONADA] ---
// Essa é a rota que resolve o "/relatorios"
router.get('/', estaLogado, eAdmin, (req, res) => {
    // Renderiza o arquivo que criamos no Passo 1
    res.render('relatorios/index', { title: 'Menu de Relatórios' });
});

// Rota protegida apenas para Admins (que já existia)
router.get('/rentabilidade', estaLogado, eAdmin, relatorioController.painelRentabilidade);

module.exports = router;