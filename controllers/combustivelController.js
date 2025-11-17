const pool = require('../db');

// MOSTRA A PÁGINA DE GERENCIAMENTO (COM ALERTA)
exports.index = async (req, res, next) => {
  try {
    const [combustiveis] = await pool.query("SELECT * FROM combustiveis");
    
    // Adiciona o status de alerta
    const combustiveisComAlerta = combustiveis.map(c => ({
      ...c,
      estoqueBaixo: parseFloat(c.estoque_litros) <= parseFloat(c.estoque_minimo_litros)
    }));
    
    res.render('combustiveis/index', { combustiveis: combustiveisComAlerta });
  } catch (err) {
    next(err);
  }
};

// ATUALIZA PREÇO, ADICIONA ESTOQUE OU REMOVE ESTOQUE
// ATUALIZA PREÇO, ESTOQUE, REMOÇÃO E PROMOÇÃO
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // 1. Pega os campos de estoque/preço (da última vez)
    let { preco_por_litro, adicionar_litros, remover_litros } = req.body;

    // 2. Pega os NOVOS campos de promoção
    const { 
      preco_promocional, 
      promo_ativo, // (Vem 'on' ou 'undefined')
      promo_hora_inicio, 
      promo_hora_fim, 
      promo_dias_semana 
    } = req.body;

    // --- Lógica de Correção de Vírgula ---
    if (preco_por_litro) { preco_por_litro = (preco_por_litro || '').replace(',', '.'); }
    if (adicionar_litros) { adicionar_litros = (adicionar_litros || '').replace(',', '.'); }
    if (remover_litros) { remover_litros = (remover_litros || '').replace(',', '.'); }
    // --- Fim da Correção ---
    
    // --- Lógica de Estoque/Preço ---
    if (preco_por_litro && preco_por_litro.length > 0) {
      await pool.execute(
        "UPDATE combustiveis SET preco_por_litro = ? WHERE id = ?",
        [preco_por_litro, id]
      );
    }
    if (adicionar_litros && parseFloat(adicionar_litros) > 0) {
      await pool.execute(
        "UPDATE combustiveis SET estoque_litros = estoque_litros + ? WHERE id = ?",
        [adicionar_litros, id]
      );
    }
    if (remover_litros && parseFloat(remover_litros) > 0) {
      await pool.execute(
        "UPDATE combustiveis SET estoque_litros = GREATEST(0, estoque_litros - ?) WHERE id = ?",
        [remover_litros, id]
      );
    }
    
    // --- [NOVO BLOCO] Lógica de Salvar a Promoção ---
    // (Verifica se o campo 'preco_promocional' foi enviado,
    // o que significa que o admin está mexendo na promoção)
    if (preco_promocional !== undefined) {
      
      // Converte o checkbox 'on' para 1 (true) ou 0 (false)
      const isAtivo = (promo_ativo === 'on') ? 1 : 0;
      
      await pool.execute(
        `UPDATE combustiveis SET
           preco_promocional = ?,
           promo_ativo = ?,
           promo_hora_inicio = ?,
           promo_hora_fim = ?,
           promo_dias_semana = ?
         WHERE id = ?`,
        [
          (preco_promocional || null), // Salva null se o campo for vazio
          isAtivo,
          (promo_hora_inicio || null),
          (promo_hora_fim || null),
          (promo_dias_semana || null),
          id
        ]
      );
    }
    // --- [FIM DO NOVO BLOCO] ---
    
    res.redirect('/combustiveis');
  } catch (err) {
    next(err);
  }
};