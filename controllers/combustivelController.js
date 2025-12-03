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

// ATUALIZA PREÇO, CUSTO, ESTOQUE, REMOÇÃO, PROMOÇÃO E MANUTENÇÃO
exports.update = async (req, res, next) => {
  try {
    console.log('DADOS RECEBIDOS DO FORMULÁRIO:', req.body);
    
    const { id } = req.params;
    
    // 1. Pega TODOS os campos possíveis do body EM UM SÓ LUGAR.
    let { 
      preco_por_litro, 
      custo_por_litro, // <--- [NOVO]
      adicionar_litros, 
      remover_litros,
      preco_promocional, 
      promo_ativo,
      promo_hora_inicio,
      promo_hora_fim,
      promo_dias_semana,
      limite_manutencao_litros
    } = req.body;

    // 2. Lógica de Correção de Vírgula
    if (preco_por_litro) { preco_por_litro = (preco_por_litro || '').replace(',', '.'); }
    if (custo_por_litro) { custo_por_litro = (custo_por_litro || '').replace(',', '.'); } // [NOVO]
    if (adicionar_litros) { adicionar_litros = (adicionar_litros || '').replace(',', '.'); }
    if (remover_litros) { remover_litros = (remover_litros || '').replace(',', '.'); }
    if (preco_promocional) { preco_promocional = (preco_promocional || '').replace(',', '.'); }
    if (limite_manutencao_litros) { limite_manutencao_litros = (limite_manutencao_litros || '').replace(',', '.'); }
    
    // 3. Atualizar Preço e Custo
    // (Agora verificamos ambos os campos)
    if ((preco_por_litro && preco_por_litro.length > 0) || (custo_por_litro && custo_por_litro.length > 0)) {
      console.log('ATUALIZANDO PREÇOS/CUSTOS...');
      
      // Se um dos campos não foi enviado, mantemos o valor atual do banco (precisaria de uma query select antes),
      // mas para simplificar aqui, vamos assumir que o form envia ambos ou atualizamos individualmente.
      // A melhor forma simples:
      if (preco_por_litro) {
        await pool.execute("UPDATE combustiveis SET preco_por_litro = ? WHERE id = ?", [preco_por_litro, id]);
      }
      if (custo_por_litro) {
        await pool.execute("UPDATE combustiveis SET custo_por_litro = ? WHERE id = ?", [custo_por_litro, id]);
      }
    }
    
    // 4. Lógica de Estoque
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
    
    // 5. Lógica de Promoção
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

    // 6. Lógica de Limite de Manutenção
    if (limite_manutencao_litros !== undefined) {
      console.log('ATUALIZANDO LIMITE DE MANUTENÇÃO...');
      await pool.execute(
        `UPDATE combustiveis SET limite_manutencao_litros = ? WHERE id = ?`,
        [ (limite_manutencao_litros || 10000), id ]
      );
    }
    
    res.redirect('/combustiveis');
  } catch (err) {
    next(err);
  }
};