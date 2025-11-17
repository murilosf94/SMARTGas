// middleware/turnoMiddleware.js
const pool = require('../db');

exports.precisaDeTurnoAberto = async (req, res, next) => {

  // --- [INÍCIO DA NOVA LÓGICA] ---
  // 1. Verifica se o usuário é um 'admin'
  if (req.session.usuario && req.session.usuario.funcao === 'admin') {
    return next(); // Se for admin, PULE toda a verificação de turno
  }
  // --- [FIM DA NOVA LÓGICA] ---


  // 2. Se não for admin (ex: 'caixa'), a lógica antiga continua:
  const frentistaId = req.session.usuario.id;

  // 3. Ele tem um turno aberto NA SESSÃO?
  if (req.session.turno_id) {
    return next(); // Sim, pode passar.
  }

  // 4. Se não tem na sessão, vamos checar no banco
  try {
    const [rows] = await pool.query(
      "SELECT id FROM turnos WHERE frentista_id = ? AND status = 'aberto'",
      [frentistaId]
    );

    if (rows.length > 0) {
      req.session.turno_id = rows[0].id;
      return next(); // Pode passar.
    }

    // 5. Se não achou NADA, ele não tem turno aberto.
    res.redirect('/turno/abrir'); 

  } catch (err) {
    return next(err);
  }
};