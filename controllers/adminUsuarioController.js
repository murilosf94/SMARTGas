// controllers/adminUsuarioController.js
const pool = require('../db'); // Importa o pool

/**
 * (R)EAD: Lista todos os usuários
 * Rota: GET /admin-usuarios
 */
// controllers/adminUsuarioController.js

/**
 * (R)EAD: Lista todos os usuários E CONTA SUAS VENDAS
 * Rota: GET /admin-usuarios
 */
exports.index = async (req, res, next) => {
  try {
    // *** ESTA É A NOVA QUERY ***
    // Ela junta 'usuarios' com 'vendas' e CONTA (COUNT) as vendas
    // onde o ID do usuário bate com o 'frentista_id'
    const [usuarios] = await pool.query(
      `SELECT 
          u.id, 
          u.usuario, 
          u.funcao, 
          COUNT(v.id) AS total_vendas 
       FROM usuarios u
       LEFT JOIN vendas v ON u.id = v.frentista_id
       WHERE u.id != ?
       GROUP BY u.id, u.usuario, u.funcao
       ORDER BY u.usuario`,
      [req.session.usuario.id] // (ID do admin logado)
    );
    
    // Enviamos os dados para o Jade (agora com a propriedade 'total_vendas')
    res.render('admin-usuarios/index', { usuarios: usuarios }); 
  
  } catch (err) {
    next(err); 
  }
};

/**
 * (U)PDATE: Mostra o formulário de edição de FUNÇÃO
 * Rota: GET /admin-usuarios/:id/edit
 */
exports.edit = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      // Usando os nomes das suas colunas
      'SELECT id, usuario, funcao FROM usuarios WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).send('Usuário não encontrado');
    }

    res.render('admin-usuarios/edit', { usuario: rows[0] });

  } catch (err) {
    next(err);
  }
};

/**
 * (U)PDATE: Salva a nova FUNÇÃO no banco
 * Rota: POST /admin-usuarios/:id
 */
exports.update = async (req, res, next) => {
  try {
    // Pega a 'funcao' do formulário
    const { funcao } = req.body;
    const { id } = req.params;

    // Medida de segurança: garantir que a 'funcao' é válida
    // (Ajuste se seus nomes de função forem diferentes)
    const funcoesValidas = ['cliente', 'caixa', 'admin'];
    if (!funcoesValidas.includes(funcao)) {
      return res.status(400).send('Função inválida.');
    }

    // Atualiza a coluna 'funcao' (a sua tabela não tem 'updatedAt')
    await pool.execute(
      'UPDATE usuarios SET funcao = ? WHERE id = ?',
      [funcao, id]
    );

    res.redirect('/admin-usuarios');

  } catch (err) {
    next(err);
  }
};