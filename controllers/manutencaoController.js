// controllers/manutencaoController.js
const pool = require('../db');

// MOSTRA A LISTA DE ALERTAS PENDENTES
exports.listarAlertas = async (req, res, next) => {
  try {
    const [alertas] = await pool.query(
      `SELECT o.*, c.nome AS combustivel_nome, 
         c.total_litros_bombeados, c.limite_manutencao_litros
       FROM ordens_manutencao o
       JOIN combustiveis c ON o.combustivel_id = c.id
       WHERE o.status = 'pendente'
       ORDER BY o.data_criacao DESC`
    );
    res.render('manutencao/index', { alertas: alertas, titulo: 'Alertas de Manutenção' });
  } catch (err) {
    next(err);
  }
};

// COMPLETA A MANUTENÇÃO E RESETA O ODÔMETRO
exports.completarManutencao = async (req, res, next) => {
  try {
    const { id_ordem, id_combustivel } = req.params;
    
    // 1. Marca a ordem como 'concluida'
    await pool.execute(
      "UPDATE ordens_manutencao SET status = 'concluida' WHERE id = ?",
      [id_ordem]
    );
    
    // 2. Reseta o odômetro e o status do TANQUE
    await pool.execute(
      "UPDATE combustiveis SET total_litros_bombeados = 0, status_manutencao = 'ok' WHERE id = ?",
      [id_combustivel]
    );
    
    res.redirect('/manutencao');
  } catch (err) {
    next(err);
  }
};