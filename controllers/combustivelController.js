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
    console.log('DADOS RECEBIDOS DO FORMULÁRIO:', req.body);
    
    const { id } = req.params;
    
    // --- [INÍCIO DA CORREÇÃO] ---
    // 1. Pega TODOS os campos possíveis do body EM UM SÓ LUGAR.
    //    Isso garante que 'limite_manutencao_litros' seja definido.
    let { 
      preco_por_litro, 
      adicionar_litros, 
      remover_litros,
      preco_promocional, 
      promo_ativo,
      promo_hora_inicio,
      promo_hora_fim,
      promo_dias_semana,
      limite_manutencao_litros // <-- Variável que faltava
    } = req.body;
    // --- [FIM DA CORREÇÃO] ---

    // 2. Lógica de Correção de Vírgula (para os campos numéricos)
    if (preco_por_litro) { preco_por_litro = (preco_por_litro || '').replace(',', '.'); }
    if (adicionar_litros) { adicionar_litros = (adicionar_litros || '').replace(',', '.'); }
    if (remover_litros) { remover_litros = (remover_litros || '').replace(',', '.'); }
    if (preco_promocional) { preco_promocional = (preco_promocional || '').replace(',', '.'); }
    if (limite_manutencao_litros) { limite_manutencao_litros = (limite_manutencao_litros || '').replace(',', '.'); }
    
    // 3. Lógica de Estoque/Preço
    if (preco_por_litro && preco_por_litro.length > 0) {
      console.log('ATUALIZANDO PREÇO...');
      await pool.execute(
        "UPDATE combustiveis SET preco_por_litro = ? WHERE id = ?",
        [preco_por_litro, id]
      );
    }
    
    if (adicionar_litros && parseFloat(adicionar_litros) > 0) {
      console.log('ADICIONANDO ESTOQUE...');
      await pool.execute(
        "UPDATE combustiveis SET estoque_litros = estoque_litros + ? WHERE id = ?",
        [adicionar_litros, id]
      );
    }
    
    if (remover_litros && parseFloat(remover_litros) > 0) {
      console.log('REMOVENDO ESTOQUE...');
      await pool.execute(
        "UPDATE combustiveis SET estoque_litros = GREATEST(0, estoque_litros - ?) WHERE id = ?",
        [remover_litros, id]
      );
    }
    
    // 4. Lógica de Salvar a Promoção
    // (Verifica se 'preco_promocional' foi enviado, o que o diferencia
    // dos outros formulários)
    if (preco_promocional !== undefined) {
      console.log('ATUALIZANDO PROMOÇÃO...');
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
          (preco_promocional || null), 
          isAtivo,
          (promo_hora_inicio || null),
          (promo_hora_fim || null),
          (promo_dias_semana || null),
          id
        ]
      );
    }

    // 5. Lógica de Salvar o Limite de Manutenção
    // (Esta é a linha 91 que deu o erro. Agora 'limite_manutencao_litros' está definido)
    if (limite_manutencao_litros !== undefined) {
      console.log('ATUALIZANDO LIMITE DE MANUTENÇÃO...');
      await pool.execute(
        `UPDATE combustiveis SET limite_manutencao_litros = ? WHERE id = ?`,
        [ (limite_manutencao_litros || 10000), id ] // (Default de 10000 se ficar vazio)
      );
    }
    
    res.redirect('/combustiveis');
  } catch (err) {
    next(err);
  }
};