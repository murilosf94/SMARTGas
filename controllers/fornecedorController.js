// controllers/fornecedorController.js
const pool = require('../db'); // Importa o pool

/**
 * (R)EAD: Lista todos os fornecedores
 * Rota: GET /fornecedores
 */
exports.index = async (req, res, next) => {
  try {
    const [fornecedores] = await pool.query(
      'SELECT * FROM fornecedores ORDER BY createdAt DESC'
    );
    
    // Renderiza o Jade, passando a variável 'fornecedores'
    res.render('fornecedores/index', { fornecedores: fornecedores }); 
  
  } catch (err) {
    next(err); // Envia o erro para o middleware
  }
};

/**
 * (C)REATE: Mostra o formulário para criar
 * Rota: GET /fornecedores/new
 */
exports.new = (req, res) => {
  res.render('fornecedores/new'); 
};

/**
 * (C)REATE: Salva o novo fornecedor no banco
 * Rota: POST /fornecedores
 */
exports.create = async (req, res, next) => {
  try {
    // 1) Pegar os dados do body (req.body)
    const { name, description, contato, cnpj, servico } = req.body;

    // 2) Usar pool.execute para inserir
    await pool.execute(
      `INSERT INTO fornecedores (name, description, contato, cnpj, servico) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, description, contato, cnpj, servico]
    );

    // 3) Redirecionar para a lista
    res.redirect('/fornecedores'); 

  } catch (err) {
    next(err);
  }
};

/**
 * (U)PDATE: Mostra o formulário de edição
 * Rota: GET /fornecedores/:id/edit
 */
exports.edit = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM fornecedores WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).send('Fornecedor não encontrado');
    }

    res.render('fornecedores/edit', { fornecedor: rows[0] });

  } catch (err) {
    next(err);
  }
};

/**
 * (U)PDATE: Salva as alterações no banco
 * Rota: POST /fornecedores/:id
 */
exports.update = async (req, res, next) => {
  try {
    const { name, description, contato, cnpj, servico } = req.body;
    
    await pool.execute(
      `UPDATE fornecedores
       SET name = ?,
           description = ?,
           contato = ?,
           cnpj = ?,
           servico = ?,
           updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, description, contato, cnpj, servico, req.params.id]
    );

    res.redirect('/fornecedores');

  } catch (err) {
    next(err);
  }
};

/**
 * (D)ELETE: Remove o fornecedor do banco
 * Rota: POST /fornecedores/:id/delete
 */
exports.destroy = async (req, res, next) => {
  try {
    await pool.execute(
      'DELETE FROM fornecedores WHERE id = ?', 
      [req.params.id]
    );
    
    res.redirect('/fornecedores');

  } catch (err) {
    next(err);
  }
};

/**
 * (R)EAD: Mostra detalhes de UM fornecedor (Opcional)
 * Rota: GET /fornecedores/:id
 */
exports.show = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM fornecedores WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).send('Fornecedor não encontrado');
    }

    res.render('fornecedores/show', { fornecedor: rows[0] });

  } catch (err) {
    next(err);
  }
};