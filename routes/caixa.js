// routes/caixa.js

var express = require('express');
var router = express.Router();

/* GET /caixa - Tela principal de vendas/caixa. */
router.get('/', function(req, res, next) {
    // Renderiza a view onde o caixa registrará a venda e fará o cadastro US-15
    res.render('caixa/vendas', { title: 'Terminal de Vendas' });
});

module.exports = router;