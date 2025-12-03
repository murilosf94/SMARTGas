const pool = require('../db');

// Mantive sua função de promoção, ela está correta
function isPromocaoAtivaAgora(combustivel) {
  if (!combustivel.promo_ativo || !combustivel.promo_hora_inicio || !combustivel.promo_hora_fim || !combustivel.promo_dias_semana) {
    return false;
  }
  const agora = new Date();
  const diaHoje = agora.getDay();
  const diasValidos = combustivel.promo_dias_semana.split(',');
  
  if (!diasValidos.includes(String(diaHoje))) {
    return false;
  }

  const [horaInicio, minInicio] = combustivel.promo_hora_inicio.split(':').map(Number);
  const [horaFim, minFim] = combustivel.promo_hora_fim.split(':').map(Number);
  
  const dataInicio = new Date();
  dataInicio.setHours(horaInicio, minInicio, 0, 0);
  
  const dataFim = new Date();
  dataFim.setHours(horaFim, minFim, 0, 0);

  if (agora >= dataInicio && agora <= dataFim) {
    return true;
  }
  return false;
}

exports.mostrarTelaVenda = async (req, res, next) => {
  try {
    // CORREÇÃO: Buscamos apenas da tabela 'combustiveis', sem JOIN com 'bombas'
    const [rows] = await pool.query(
      `SELECT * FROM combustiveis ORDER BY nome`
    );
    
    const combustiveisComPreco = rows.map(item => {
      const emPromocao = isPromocaoAtivaAgora(item);
      
      return {
        ...item,
        estoqueBaixo: parseFloat(item.estoque_litros) <= parseFloat(item.estoque_minimo_litros),
        preco_vigente: emPromocao ? item.preco_promocional : item.preco_por_litro,
        emPromocao: emPromocao
      };
    });
    
    // Passamos a lista como 'combustiveis' para a view
    res.render('venda-combustivel/index', { 
      combustiveis: combustiveisComPreco,
      titulo: 'Frente de Caixa - Combustível'
    });
  } catch (err) {
    next(err);
  }
};

exports.registrarVenda = async (req, res, next) => {
  try {
    // CORREÇÃO: Recebemos 'combustivel_id' em vez de 'bomba_id'
    const { combustivel_id, valor_reais, valor_litros } = req.body;
    const { id: frentista_id } = req.session.usuario;
    const turno_id = req.session.turno_id;

    // 1. Busca os dados do Combustível
    const [rows] = await pool.query(
      `SELECT * FROM combustiveis WHERE id = ?`,
      [combustivel_id]
    );
    
    if (rows.length === 0) return res.status(404).send("Combustível não encontrado.");
    
    const item = rows[0];
    const estoqueAtual = parseFloat(item.estoque_litros);

    // Verifica bloqueio de manutenção
    if (item.status_manutencao === 'manutencao_necessaria') { // ajuste conforme seu ENUM no banco, talvez seja 'alerta'
       // Se quiser bloquear venda no alerta, mantenha. Se for só aviso, remova.
    }

    const emPromocao = isPromocaoAtivaAgora(item);
    const precoLitro = parseFloat(emPromocao ? item.preco_promocional : item.preco_por_litro);

    // 2. Cálculos de Valor e Litros
    let litrosVendidos = 0;
    let valorVenda = 0;

    // Lógica para calcular baseado no que foi preenchido
    if (valor_reais && parseFloat(valor_reais.replace(',', '.')) > 0) {
      valorVenda = parseFloat(valor_reais.replace(',', '.'));
      litrosVendidos = valorVenda / precoLitro;
    } else if (valor_litros && parseFloat(valor_litros.replace(',', '.')) > 0) {
      litrosVendidos = parseFloat(valor_litros.replace(',', '.'));
      valorVenda = litrosVendidos * precoLitro;
    } else {
      return res.status(400).send("Preencha o valor em Reais ou a quantidade de Litros.");
    }

    // 3. Verifica Estoque
    if (estoqueAtual < litrosVendidos) {
      return res.status(400).send("Estoque insuficiente no tanque.");
    }

    const novoTotalBombeado = parseFloat(item.total_litros_bombeados) + litrosVendidos;

    // 4. Atualiza o Combustível (Estoque e Odômetro)
    await pool.execute(
      `UPDATE combustiveis SET 
         estoque_litros = estoque_litros - ?,
         total_litros_bombeados = ?
       WHERE id = ?`,
      [litrosVendidos, novoTotalBombeado, combustivel_id]
    );

    // 5. Insere a Venda
    // Removemos 'bomba_id' do INSERT pois a tabela não existe mais
    await pool.execute(
      `INSERT INTO vendas (frentista_id, turno_id, combustivel_id, valor_venda, tipo_venda, quantidade) 
       VALUES (?, ?, ?, ?, 'combustivel', ?)`,
      [frentista_id, turno_id, combustivel_id, valorVenda, litrosVendidos]
    );
    
    // 6. Lógica de Manutenção (Agora baseada no combustível/tanque)
    const limite = parseFloat(item.limite_manutencao_litros);
    const limiar = parseFloat(item.limiar_alerta_percentual); // ex: 0.95
    
    // Se atingiu o limite para alerta
    if (novoTotalBombeado >= (limite * limiar) && item.status_manutencao === 'ok') {
      
      // Atualiza status do combustível
      await pool.execute(
        "UPDATE combustiveis SET status_manutencao = 'alerta' WHERE id = ?",
        [combustivel_id]
      );
      
      // Cria ordem de manutenção
      // CORREÇÃO: Usamos 'combustivel_id' na tabela ordens_manutencao
      await pool.execute(
        `INSERT INTO ordens_manutencao (combustivel_id, motivo) 
         VALUES (?, 'Manutenção preventiva: Limite de litros atingido.')`,
        [combustivel_id]
      );
    }
    
    res.redirect('/venda-combustivel'); 
    
  } catch (err) {
    next(err);
  }
};