// controllers/AdminController.js

const pool = require('../db');
const bcrypt = require('bcrypt'); // Necessário para US-13 (segurança da senha)

// ==========================================================
// US-13: Métodos para Funcionários
// ==========================================================

exports.createEmployee = async (req, res, next) => {
    // Lógica da US-13 (para o POST /api/admin/employees)
    // ... (Implementação do createEmployee vai aqui)
    res.status(501).json({ error: 'Funcionalidade createEmployee não implementada.' });
};

exports.listEmployees = async (req, res, next) => {
    // Lógica da US-13 (para o GET /api/admin/employees)
    // ... (Implementação do listEmployees vai aqui)
    res.status(501).json({ error: 'Funcionalidade listEmployees não implementada.' });
};


// ==========================================================
// US-15: Cadastro Rápido de Cliente (Customer)
// ==========================================================

exports.quickRegisterCustomer = async (req, res, next) => {
    // Lógica da US-15 (para o POST /api/admin/customers/quick-register)
    try {
        const { cpf, name, phone } = req.body;
        
        if (!cpf || !name || !phone) {
            return res.status(400).json({ 
                error: 'CPF, Nome e Telefone são obrigatórios para o cadastro rápido.' 
            });
        }
        
        // Insere o novo cliente
        const [result] = await pool.execute(
            `INSERT INTO customers 
             (cpf, name, phone, loyaltyPoints) 
             VALUES (?, ?, ?, 0)`,
            [cpf, name, phone]
        );
        
        const newCustomerId = result.insertId;
        
        res.status(201).json({ 
            message: 'Cliente fidelidade cadastrado com sucesso!', 
            customerId: newCustomerId 
        });

    } catch (err) {
        console.error('Erro ao cadastrar cliente fidelidade:', err);
        // Retorna 409 (Conflict) em caso de CPF duplicado
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'CPF já cadastrado no programa de fidelidade.' });
        }
        next(err);
    }
};


// ==========================================================
// US-17: Métodos para Fornecedores (Supplier)
// ==========================================================
exports.createSupplier = async (req, res, next) => {
    // Lógica da US-17 (para o POST /api/admin/suppliers)
    // ... (Implementação do createSupplier vai aqui)
    res.status(501).json({ error: 'Funcionalidade createSupplier não implementada.' });
};
exports.listSuppliers = async (req, res, next) => {
    // Lógica da US-17 (para o GET /api/admin/suppliers)
    // ... (Implementação do listSuppliers vai aqui)
    res.status(501).json({ error: 'Funcionalidade listSuppliers não implementada.' });
};


// ==========================================================
// US-12: Métodos para Despesas (Expense)
// ==========================================================
exports.createExpense = async (req, res, next) => {
    // Lógica da US-12 (para o POST /api/admin/expenses)
    // ... (Implementação do createExpense vai aqui)
    res.status(501).json({ error: 'Funcionalidade createExpense não implementada.' });
};
exports.listExpenses = async (req, res, next) => {
    // Lógica da US-12 (para o GET /api/admin/expenses)
    // ... (Implementação do listExpenses vai aqui)
    res.status(501).json({ error: 'Funcionalidade listExpenses não implementada.' });
};