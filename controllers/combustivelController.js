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
exports.update = async (req, res, next) => {
  try {
    // Log para depuração
    console.log('DADOS RECEBIDOS DO FORMULÁRIO:', req.body);

    const { id } = req.params;
    
    // 1. Pega os 3 possíveis campos do body
    let { preco_por_litro, adicionar_litros, remover_litros } = req.body;

    // --- [INÍCIO DA CORREÇÃO da Vírgula] ---
    // 2. Substitui vírgula por ponto (padrão pt-BR para en-US)
    if (preco_por_litro) {
      preco_por_litro = (preco_por_litro || '').replace(',', '.');
    }
    if (adicionar_litros) {
      adicionar_litros = (adicionar_litros || '').replace(',', '.');
    }
    if (remover_litros) {
      remover_litros = (remover_litros || '').replace(',', '.');
    }
    // --- [FIM DA CORREÇÃO da Vírgula] ---
    
    // 3. A lógica continua, agora com os valores corrigidos
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
    
    res.redirect('/combustiveis');
  } catch (err) {
    next(err);
  }
};