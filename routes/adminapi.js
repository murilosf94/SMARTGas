// routes/adminapi.js

const express = require('express');
const router = express.Router();
// Presume que a lógica de negócio estará no AdminController
const ctrl = require('../controllers/AdminController'); 
const { estaLogado } = require('../middleware/authmiddleware'); // Para proteger a API

// Aplicar o middleware de autenticação a todas as rotas desta API
router.use(estaLogado); 


// ==========================================================
// US-15: Cadastro de Cliente em Programa de Fidelidade (Customer)
// POST /api/admin/customers/quick-register
// ==========================================================
router.post('/customers/quick-register', ctrl.quickRegisterCustomer); 


// ==========================================================
// US-13: Cadastro e Gerenciamento de Funcionários (Employee)
// ==========================================================
router.post('/employees', ctrl.createEmployee); 
router.get('/employees', ctrl.listEmployees); 
// ... adicione as outras rotas (put/delete) conforme necessário


// ==========================================================
// US-17: Cadastro de Fornecedores (Supplier)
// ==========================================================
router.post('/suppliers', ctrl.createSupplier);
router.get('/suppliers', ctrl.listSuppliers);
// ... adicione as outras rotas (put/delete) conforme necessário


// ==========================================================
// US-12: Registro de Despesa Operacional (Expense)
// ==========================================================
router.post('/expenses', ctrl.createExpense);
router.get('/expenses', ctrl.listExpenses);
// ... adicione as outras rotas (put/delete) conforme necessário


module.exports = router;