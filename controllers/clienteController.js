// controllers/clienteController.js
const pool = require('../db'); // Importa o pool

/**
 * (R)EAD: Lista todos os clientes
 * Rota: GET /clientes
 */
exports.index = async (req, res, next) => {
  try {
    const [clientes] = await pool.query(
      'SELECT * FROM clientes ORDER BY createdAt DESC'
    );
    
    // Renderiza o Jade, passando a variável 'clientes'
    res.render('clientes/index', { clientes: clientes }); 
  
  } catch (err) {
    next(err); // Envia o erro para o middleware
  }
};

/**
 * (C)REATE: Mostra o formulário para criar
 * Rota: GET /clientes/new
 */
exports.new = (req, res) => {
  // Apenas renderiza o PUG
  res.render('clientes/new'); 
};

/**
 * (C)REATE: Salva o novo cliente no banco
 * Rota: POST /clientes
 */
exports.create = async (req, res, next) => {
  try {
    // 1) Pegar os dados do body (sem fidelidade, que começa com DEFAULT 0)
    const { name, description, cpf, contato } = req.body;

    // 2) Usar pool.execute para inserir
    await pool.execute(
      `INSERT INTO clientes (name, description, cpf, contato) 
       VALUES (?, ?, ?, ?)`,
      [name, description, cpf, contato]
    );

    // 3) Redirecionar para a lista
    res.redirect('/clientes'); 

  } catch (err) {
    next(err);
  }
};

/**
 * (U)PDATE: Mostra o formulário de edição (com o campo fidelidade)
 * Rota: GET /clientes/:id/edit
 */
exports.edit = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM clientes WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).send('Cliente não encontrado');
    }

    // Renderiza o edit, passando o 'cliente' encontrado
    res.render('clientes/edit', { cliente: rows[0] });

  } catch (err) {
    next(err);
  }
};

/**
 * (U)PDATE: Salva as alterações no banco (incluindo fidelidade)
 * Rota: POST /clientes/:id
 */
exports.update = async (req, res, next) => {
  try {
    // AQUI é o ponto chave: pegamos a fidelidade do formulário de edição
    const { name, description, cpf, contato, fidelidade } = req.body;
    
    await pool.execute(
      `UPDATE clientes
       SET name = ?,
           description = ?,
           cpf = ?,
           contato = ?,
           fidelidade = ?, 
           updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, description, cpf, contato, fidelidade, req.params.id]
    );

    res.redirect('/clientes');

  } catch (err) {
    next(err);
  }
};

/**
 * (D)ELETE: Remove o cliente do banco
 * Rota: POST /clientes/:id/delete
 */
exports.destroy = async (req, res, next) => {
  try {
    await pool.execute(
      'DELETE FROM clientes WHERE id = ?', 
      [req.params.id]
    );
    
    res.redirect('/clientes');

  } catch (err) {
    next(err);
  }
};

/**
 * (R)EAD: Mostra detalhes de UM cliente (Opcional)
 * Rota: GET /clientes/:id
 */
exports.show = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM clientes WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).send('Cliente não encontrado');
    }

    res.render('clientes/show', { cliente: rows[0] });

  } catch (err) {
    next(err);
  }
};