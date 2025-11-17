// routes/index.js (COMO DEVE FICAR - VERSÃO LIMPA)
var express = require('express');
var router = express.Router();
const pool = require('../db'); // <-- 1. IMPORTANTE: Importe o pool do DB

/* GET home page. */
// 2. Adicione 'async' na função
router.get('/', async function(req, res, next) {
  
  let turnoAbertoId = null;

  // 3. Verifica o status do turno APENAS se o usuário estiver logado
  if (req.session && req.session.usuario) {
    const frentistaId = req.session.usuario.id;
    
    // 4. Tenta pegar o turno da sessão (rápido)
    turnoAbertoId = req.session.turno_id || null;

    // 5. Se não tem na sessão, checa o banco (só por garantia)
    if (!turnoAbertoId) {
      try {
        const [rows] = await pool.query(
          "SELECT id FROM turnos WHERE frentista_id = ? AND status = 'aberto'",
          [frentistaId]
        );
        if (rows.length > 0) {
          turnoAbertoId = rows[0].id;
          req.session.turno_id = turnoAbertoId; // Salva na sessão para agilizar
        }
      } catch (err) {
        return next(err); // Se der erro no DB, pare aqui
      }
    }
  }

  // 6. Renderiza o 'index', passando a nova variável 'turnoAberto'
  res.render('index', { 
    title: 'SmartGas',
    // '!!' (dupla negação) converte o ID (ou null) para true/false
    turnoAberto: !!turnoAbertoId 
  });
});

module.exports = router;