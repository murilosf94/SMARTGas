// routes/carrinho.js

// --- [ INÍCIO DA CORREÇÃO ] ---
// 1. Você precisa importar o express
const express = require('express');

// 2. Você precisa DEFINIR o 'router' (Esta era a linha que faltava)
const router = express.Router();
// --- [ FIM DA CORREÇÃO ] ---


// 3. Importe o controller
const carrinhoController = require('../controllers/carrinhoController');

// Rota para MOSTRAR o carrinho (GET /carrinho/:id)
// Esta é a linha 8 que deu o erro
router.get('/:id', carrinhoController.show); 

// Rota para ADICIONAR (POST /carrinho/add/:id/:id2)
router.post('/add/:id/:id2', carrinhoController.add); 

// Rota para COMPRAR UM (POST /carrinho/comprar/:id/:id2)
router.post('/comprar/:id/:id2', carrinhoController.comprar);

// Rota para COMPRAR TUDO (Checkout) (POST /carrinho/:id/checkout)
router.post('/:id/checkout', carrinhoController.checkoutCarrinho);

router.post('/remover/:id/:id2', carrinhoController.removerItem);

module.exports = router;

// 4. Exporte o router
module.exports = router;