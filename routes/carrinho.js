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


// routes/carrinho.js

// ... (outras rotas) ...

// 1. [NOVA ROTA] GET para ver a tela de pagamento
router.get('/:id/pagamento', carrinhoController.telaPagamento);

// 2. [ROTA ATUALIZADA] O POST do checkout continua o mesmo, 
// mas agora ele será chamado pela tela de pagamento, não pelo carrinho direto.
router.post('/:id/checkout', carrinhoController.checkoutCarrinho);

module.exports = router;

