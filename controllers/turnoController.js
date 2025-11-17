// controllers/turnoController.js
const pool = require('../db');

// MOSTRA A PÁGINA "ABRIR TURNO"
exports.mostrarFormAbrir = (req, res) => {
  res.render('turno/abrir', { titulo: 'Abrir Caixa' });
};

// PROCESSA A ABERTURA DO TURNO
exports.abrirTurno = async (req, res, next) => {
  try {
    const { valor_inicial } = req.body; // Pega o troco do formulário
    const frentistaId = req.session.usuario.id;

    // (Aqui você deveria checar se ele JÁ não tem um turno aberto)

    const [result] = await pool.execute(
      "INSERT INTO turnos (frentista_id, valor_inicial) VALUES (?, ?)",
      [frentistaId, valor_inicial]
    );

    // O PULO DO GATO: Salva o ID do turno na sessão
    req.session.turno_id = result.insertId; 

    res.redirect('/'); // Redireciona para a home (ou para a tela de vendas)

  } catch (err) {
    next(err);
  }
};

// MOSTRA O RELATÓRIO E A PÁGINA "FECHAR TURNO"
exports.mostrarFormFechar = async (req, res, next) => {
  try {
    const turnoId = req.session.turno_id;
    if (!turnoId) {
      return res.redirect('/turno/abrir');
    }

    // 1. Busca o valor inicial do turno
    const [turnoRows] = await pool.query(
      "SELECT valor_inicial FROM turnos WHERE id = ?", [turnoId]
    );
    const valorInicial = parseFloat(turnoRows[0].valor_inicial);

    // 2. Busca o total de VENDAS (+) desse turno
    const [vendasRows] = await pool.query(
      "SELECT SUM(valor_venda) AS total_vendas FROM vendas WHERE turno_id = ?",
      [turnoId]
    );
    const totalVendas = parseFloat(vendasRows[0].total_vendas) || 0;

    // 3. *** [NOVO] *** Busca o total de DESPESAS (-) desse turno
    const [despesasRows] = await pool.query(
      "SELECT SUM(price) AS total_despesas FROM despesas WHERE turno_id = ?",
      [turnoId]
    );
    const totalDespesas = parseFloat(despesasRows[0].total_despesas) || 0;

    // 4. *** [CÁLCULO ATUALIZADO] ***
    const valorEsperado = (valorInicial + totalVendas) - totalDespesas;

    // 5. Renderiza a página com o relatório completo
    res.render('turno/fechar', {
      titulo: 'Fechar Caixa',
      valorInicial: valorInicial.toFixed(2),
      totalVendas: totalVendas.toFixed(2),
      totalDespesas: totalDespesas.toFixed(2), // <-- Nova variável
      valorEsperado: valorEsperado.toFixed(2)
    });

  } catch (err) {
    next(err);
  }
};

// PROCESSA O FECHAMENTO DO TURNO
exports.fecharTurno = async (req, res, next) => {
  try {
    const { valor_final } = req.body; // Dinheiro que o frentista contou
    const turnoId = req.session.turno_id;

    await pool.execute(
      "UPDATE turnos SET status = 'fechado', valor_final = ?, data_fechamento = NOW() WHERE id = ?",
      [valor_final, turnoId]
    );

    // O PULO DO GATO: Limpa o ID do turno da sessão
    req.session.turno_id = null;

    // (Opcional: redireciona para uma tela de "logout" ou "turno fechado")
    res.redirect('/turno/abrir'); 

  } catch (err) {
    next(err);
  }
};

exports.listarTurnos = async (req, res, next) => {
  try {
    // 1. Query complexa que busca TUDO:
    //    Junta turnos + usuarios (para ter o nome)
    //    Junta vendas e despesas (para calcular o relatório)
    const [turnos] = await pool.query(
      `SELECT 
         t.id, t.status, t.data_abertura, t.data_fechamento,
         t.valor_inicial, t.valor_final,
         u.usuario AS frentista_nome,
         COALESCE(SUM(DISTINCT v.valor_venda), 0) AS total_vendas,
         COALESCE(SUM(DISTINCT d.price), 0) AS total_despesas
       FROM turnos t
       JOIN usuarios u ON t.frentista_id = u.id
       LEFT JOIN vendas v ON v.turno_id = t.id
       LEFT JOIN despesas d ON d.turno_id = t.id
       GROUP BY t.id, u.usuario, t.status, t.data_abertura, t.data_fechamento, t.valor_inicial, t.valor_final
       ORDER BY t.data_abertura DESC`
    );
    
    // 2. Pré-calcula os totais (lucros/diferenças) para o Jade
    const turnosComRelatorio = turnos.map(turno => {
      const valorInicial = parseFloat(turno.valor_inicial);
      const totalVendas = parseFloat(turno.total_vendas);
      const totalDespesas = parseFloat(turno.total_despesas);
      const valorFinal = parseFloat(turno.valor_final) || 0;
      
      const valorEsperado = (valorInicial + totalVendas) - totalDespesas;
      
      // Diferença = o que foi contado MENOS o que era esperado
      // (Só calcula se o turno estiver fechado)
      const diferenca = (turno.status === 'fechado') ? (valorFinal - valorEsperado) : 0;
      
      return {
        ...turno, // Traz todos os dados originais
        valorInicial: valorInicial.toFixed(2),
        totalVendas: totalVendas.toFixed(2),
        totalDespesas: totalDespesas.toFixed(2),
        valorEsperado: valorEsperado.toFixed(2),
        valorFinal: (turno.status === 'fechado') ? valorFinal.toFixed(2) : 'Aberto',
        diferenca: diferenca.toFixed(2)
      };
    });
    
    res.render('turno/historico', { 
      turnos: turnosComRelatorio,
      titulo: 'Histórico de Turnos' 
    });
    
  } catch (err) {
    next(err);
  }
};