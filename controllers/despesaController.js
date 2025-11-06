// controllers/despesaController.js
const pool = require('../db'); // Importa o pool

/**
 * (R)EAD: Lista todas as despesas
 * Rota: GET /despesas
 */
exports.index = async (req, res, next) => {
  try {
    // 1. A query busca os dados e os coloca na constante 'despesas'
    const [despesas] = await pool.query(
      'SELECT * FROM despesas ORDER BY createdAt DESC'
    );
    
    // 2. Você ENVIA a variável 'despesas' para o 'index.jade'
    //    A chave { despesas: despesas } significa:
    //    "No Jade, crie uma variável 'despesas' que contém o valor da minha constante 'despesas'"
    res.render('despesas/index', { despesas: despesas }); 
  
  } catch (err) {
    next(err); // Envia o erro para o middleware
  }
};

/**
 * (R)EAD: Mostra detalhes de UMA despesa
 * Rota: GET /despesas/:id
 */
exports.show = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM despesas WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).send('Despesa não encontrada');
    }

    res.render('despesas/show', { despesa: rows[0] });

  } catch (err) {
    next(err);
  }
};

/**
 * (C)REATE: Mostra o formulário para criar
 * Rota: GET /despesas/new
 */
exports.new = (req, res) => {
  // Apenas renderiza o PUG (não precisa de try/catch)
  res.render('despesas/new'); 
};

/**
 * (C)REATE: Salva a nova despesa no banco
 * Rota: POST /despesas
 */
exports.create = async (req, res, next) => {
  try {
    // 1) Pegar os dados do body (req.body)
    const name = req.body.name ?? '';
    const description = req.body.description ?? '';
    const price = req.body.price ? parseFloat(req.body.price) : 0;

    // 2) Usar pool.execute para inserir (igual ao seu)
    await pool.execute(
      'INSERT INTO despesas (name, description, price) VALUES (?, ?, ?)',
      [name, description, price]
    );

    // 3) Redirecionar para a lista
    res.redirect('/despesas'); 

  } catch (err) {
    next(err);
  }
};

/**
 * (U)PDATE: Mostra o formulário de edição
 * Rota: GET /despesas/:id/edit
 */
exports.edit = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM despesas WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).send('Despesa não encontrada');
    }

    res.render('despesas/edit', { despesa: rows[0] });

  } catch (err) {
    next(err);
  }
};

/**
 * (U)PDATE: Salva as alterações no banco
 * Rota: POST (ou PUT/PATCH) /despesas/:id
 */
exports.update = async (req, res, next) => {
  try {
    const { name, description, price } = req.body;
    
    // A sua tabela já tem 'ON UPDATE CURRENT_TIMESTAMP', 
    // mas vamos adicionar manualmente para manter o padrão do seu 'productController'
    await pool.execute(
      `UPDATE despesas
       SET name = ?,
           description = ?,
           price = ?,
           updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, description, price, req.params.id]
    );

    res.redirect('/despesas');

  } catch (err) {
    next(err);
  }
};

/**
 * (D)ELETE: Remove a despesa do banco
 * Rota: POST (ou DELETE) /despesas/:id/delete
 */
exports.destroy = async (req, res, next) => {
  try {
    await pool.execute(
      'DELETE FROM despesas WHERE id = ?', 
      [req.params.id]
    );
    
    res.redirect('/despesas');

  } catch (err) {
    next(err);
  }
};