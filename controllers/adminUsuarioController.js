// controllers/adminUsuarioController.js
const pool = require('../db'); // Importa o pool

/**
 * (R)EAD: Lista todos os usuários
 * Rota: GET /admin-usuarios
 */
exports.index = async (req, res, next) => {
  try {
    // Busca todos, exceto o usuário que está logado
    const [usuarios] = await pool.query(
      // Usando os nomes das suas colunas: id, usuario, funcao
      'SELECT id, usuario, funcao FROM usuarios WHERE id != ? ORDER BY usuario',
      [req.session.usuario.id] // Assumindo que o ID do admin está na sessão
    );
    
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