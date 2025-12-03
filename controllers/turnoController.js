// controllers/turnoController.js
const pool = require('../db');

// MOSTRA A PÁGINA "ABRIR TURNO"
exports.mostrarFormAbrir = (req, res) => {
  res.render('turno/abrir', { titulo: 'Abrir Caixa' });
};

// PROCESSA A ABERTURA DO TURNO
exports.abrirTurno = async (req, res, next) => {
  try {
    const { valor_inicial } = req.body; 
    const frentistaId = req.session.usuario.id;

    // Verifica se já tem turno aberto (opcional, mas recomendado)
    const [turnoAberto] = await pool.query("SELECT id FROM turnos WHERE frentista_id = ? AND status = 'aberto'", [frentistaId]);
    if (turnoAberto.length > 0) {
        req.session.turno_id = turnoAberto[0].id; // Recupera a sessão se caiu
        return res.redirect('/');
    }

    const [result] = await pool.execute(
      "INSERT INTO turnos (frentista_id, valor_inicial) VALUES (?, ?)",
      [frentistaId, valor_inicial]
    );

    req.session.turno_id = result.insertId; 
    res.redirect('/'); 

  } catch (err) {
    next(err);
  }
};

// --- [LÓGICA ALTERADA AQUI] ---
// MOSTRA O RELATÓRIO E A PÁGINA "FECHAR TURNO"
exports.mostrarFormFechar = async (req, res, next) => {
  try {
    const turnoId = req.session.turno_id;
    if (!turnoId) {
      return res.redirect('/turno/abrir');
    }

    // 1. Busca o valor inicial
    const [turnoRows] = await pool.query("SELECT valor_inicial FROM turnos WHERE id = ?", [turnoId]);
    const valorInicial = parseFloat(turnoRows[0].valor_inicial);

    // 2. Busca o total de DESPESAS (-)
    const [despesasRows] = await pool.query("SELECT SUM(price) AS total_despesas FROM despesas WHERE turno_id = ?", [turnoId]);
    const totalDespesas = parseFloat(despesasRows[0].total_despesas) || 0;

    // 3. *** [NOVO] *** Busca vendas AGRUPADAS por método de pagamento
    const [vendasRows] = await pool.query(
      `SELECT metodo_pagamento, SUM(valor_venda) as subtotal 
       FROM vendas 
       WHERE turno_id = ? 
       GROUP BY metodo_pagamento`,
      [turnoId]
    );

    // Inicializa os contadores
    let resumoVendas = {
        dinheiro: 0,
        credito: 0,
        debito: 0,
        pix_app: 0,
        total_geral: 0
    };

    // Preenche com os dados do banco
    vendasRows.forEach(row => {
        const valor = parseFloat(row.subtotal);
        resumoVendas[row.metodo_pagamento] = valor; // ex: resumoVendas['credito'] = 100.00
        resumoVendas.total_geral += valor;
    });

    // 4. *** [CÁLCULO DO CAIXA FÍSICO] ***
    // O que se espera contar na gaveta é:
    // Troco Inicial + Vendas em DINHEIRO - Despesas (Sangrias)
    // Cartão e Pix não entram na conta da gaveta física!
    const valorEsperadoGaveta = (valorInicial + resumoVendas.dinheiro) - totalDespesas;

    // 5. Renderiza
    res.render('turno/fechar', {
      titulo: 'Fechar Caixa',
      valorInicial: valorInicial.toFixed(2),
      totalDespesas: totalDespesas.toFixed(2),
      
      // Passamos o objeto detalhado
      vendas: {
          dinheiro: resumoVendas.dinheiro.toFixed(2),
          credito: resumoVendas.credito.toFixed(2),
          debito: resumoVendas.debito.toFixed(2),
          pix_app: resumoVendas.pix_app.toFixed(2),
          total: resumoVendas.total_geral.toFixed(2)
      },

      valorEsperado: valorEsperadoGaveta.toFixed(2)
    });

  } catch (err) {
    next(err);
  }
};

// PROCESSA O FECHAMENTO DO TURNO
exports.fecharTurno = async (req, res, next) => {
  try {
    const { valor_final } = req.body; 
    const turnoId = req.session.turno_id;

    await pool.execute(
      "UPDATE turnos SET status = 'fechado', valor_final = ?, data_fechamento = NOW() WHERE id = ?",
      [valor_final, turnoId]
    );

    req.session.turno_id = null;
    res.redirect('/turno/abrir'); 

  } catch (err) {
    next(err);
  }
};

exports.listarTurnos = async (req, res, next) => {
  try {
    // 1. Query atualizada com CASE WHEN para separar os tipos de pagamento
    const [turnos] = await pool.query(
      `SELECT 
          t.id, t.status, t.data_abertura, t.data_fechamento,
          t.valor_inicial, t.valor_final,
          u.usuario AS frentista_nome,
          
          COALESCE(SUM(d.price), 0) AS total_despesas,

          -- Separação das Vendas
          COALESCE(SUM(CASE WHEN v.metodo_pagamento = 'dinheiro' THEN v.valor_venda ELSE 0 END), 0) AS v_dinheiro,
          COALESCE(SUM(CASE WHEN v.metodo_pagamento = 'credito' THEN v.valor_venda ELSE 0 END), 0) AS v_credito,
          COALESCE(SUM(CASE WHEN v.metodo_pagamento = 'debito' THEN v.valor_venda ELSE 0 END), 0) AS v_debito,
          COALESCE(SUM(CASE WHEN v.metodo_pagamento = 'pix_app' THEN v.valor_venda ELSE 0 END), 0) AS v_pix,
          COALESCE(SUM(v.valor_venda), 0) AS total_vendas

        FROM turnos t
        JOIN usuarios u ON t.frentista_id = u.id
        LEFT JOIN vendas v ON v.turno_id = t.id
        LEFT JOIN despesas d ON d.turno_id = t.id
        GROUP BY t.id
        ORDER BY t.data_abertura DESC`
    );
    
    const turnosComRelatorio = turnos.map(turno => {
      const valorInicial = parseFloat(turno.valor_inicial);
      const vDinheiro = parseFloat(turno.v_dinheiro);
      const totalDespesas = parseFloat(turno.total_despesas);
      const valorFinal = parseFloat(turno.valor_final) || 0;
      
      // O esperado na gaveta agora considera apenas o dinheiro físico
      const valorEsperadoGaveta = (valorInicial + vDinheiro) - totalDespesas;
      
      const diferenca = (turno.status === 'fechado') ? (valorFinal - valorEsperadoGaveta) : 0;
      
      return {
        ...turno,
        valorInicial: valorInicial.toFixed(2),
        totalDespesas: totalDespesas.toFixed(2),
        
        vDinheiro: vDinheiro.toFixed(2),
        vCartao: (parseFloat(turno.v_credito) + parseFloat(turno.v_debito)).toFixed(2), // Agrupamos cartões para a tabela não ficar gigante
        vPix: parseFloat(turno.v_pix).toFixed(2),
        totalVendas: parseFloat(turno.total_vendas).toFixed(2),
        
        valorEsperado: valorEsperadoGaveta.toFixed(2),
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