// controllers/vendaCombustivelController.js
const pool = require('../db');

// --- [INÍCIO DA NOVA FUNÇÃO HELPER] ---
/**
 * Verifica se uma promoção de combustível está ativa AGORA.
 * @param {object} combustivel - O objeto combustível vindo do banco.
 * @returns {boolean} - True se a promoção estiver ativa, false caso contrário.
 */
function isPromocaoAtivaAgora(combustivel) {
  // 1. Promoção está ligada?
  if (!combustivel.promo_ativo || !combustivel.promo_hora_inicio || !combustivel.promo_hora_fim || !combustivel.promo_dias_semana) {
    return false; // Se faltar qualquer regra, não está ativa.
  }

  // 2. O dia da semana bate?
  const agora = new Date();
  const diaHoje = agora.getDay(); // Domingo=0, Segunda=1, etc.
  const diasValidos = combustivel.promo_dias_semana.split(','); // Ex: ['1', '2', '3']
  
  if (!diasValidos.includes(String(diaHoje))) {
    return false; // Hoje não é um dia válido para a promoção.
  }

  // 3. A hora bate? (Esta parte é chata em JS)
  const [horaInicio, minInicio] = combustivel.promo_hora_inicio.split(':').map(Number);
  const [horaFim, minFim] = combustivel.promo_hora_fim.split(':').map(Number);
  
  const dataInicio = new Date();
  dataInicio.setHours(horaInicio, minInicio, 0, 0); // Ex: Hoje às 14:00:00
  
  const dataFim = new Date();
  dataFim.setHours(horaFim, minFim, 0, 0); // Ex: Hoje às 16:00:00

  // Compara o 'agora' com o início e o fim
  if (agora >= dataInicio && agora <= dataFim) {
    return true; // ESTAMOS NA HORA DO HAPPY HOUR!
  }

  return false; // A hora já passou ou ainda não começou.
}
// --- [FIM DA NOVA FUNÇÃO HELPER] ---


// MOSTRA A PÁGINA DE VENDA COM OS PREÇOS (NORMAIS OU PROMOCIONAIS)
exports.mostrarTelaVenda = async (req, res, next) => {
  try {
    const [combustiveis] = await pool.query("SELECT * FROM combustiveis");
    
    // Agora, para cada combustível, checamos se a promo está ativa
    const combustiveisComPrecoCorreto = combustiveis.map(c => {
      const emPromocao = isPromocaoAtivaAgora(c);
      
      return {
        ...c,
        estoqueBaixo: parseFloat(c.estoque_litros) <= parseFloat(c.estoque_minimo_litros),
        
        // --- [LÓGICA DO PREÇO] ---
        // Se 'emPromocao' for true, o preço_vigente é o promocional
        // Se for false, o preço_vigente é o normal
        preco_vigente: emPromocao ? c.preco_promocional : c.preco_por_litro,
        emPromocao: emPromocao // Passa a info para o Jade (para mostrar um aviso)
      };
    });
    
    res.render('venda-combustivel/index', { combustiveis: combustiveisComPrecoCorreto });
  } catch (err) {
    next(err);
  }
};

// PROCESSA A VENDA (COM O PREÇO CORRETO)
exports.registrarVenda = async (req, res, next) => {
  try {
    const { combustivel_id, valor_reais, valor_litros } = req.body;
    const { id: frentista_id } = req.session.usuario;
    const turno_id = req.session.turno_id;

    // 1. Pega TODAS as regras do combustível no banco
    const [rows] = await pool.query(
      "SELECT * FROM combustiveis WHERE id = ?",
      [combustivel_id]
    );
    
    if (rows.length === 0) return res.status(404).send("Combustível não encontrado.");

    const combustivel = rows[0];
    const estoqueAtual = parseFloat(combustivel.estoque_litros);

    // 2. *** A MÁGICA ***
    //    Calcula o preço que DEVE ser usado AGORA
    const emPromocao = isPromocaoAtivaAgora(combustivel);
    const precoLitro = parseFloat(emPromocao ? combustivel.preco_promocional : combustivel.preco_por_litro);

    // 3. A LÓGICA DE CONVERSÃO (que você já tinha)
    let litrosVendidos = 0;
    let valorVenda = 0;

    if (valor_reais && parseFloat(valor_reais.replace(',', '.')) > 0) {
      valorVenda = parseFloat(valor_reais.replace(',', '.'));
      litrosVendidos = valorVenda / precoLitro;
    } else if (valor_litros && parseFloat(valor_litros.replace(',', '.')) > 0) {
      litrosVendidos = parseFloat(valor_litros.replace(',', '.'));
      valorVenda = litrosVendidos * precoLitro;
    } else {
      return res.status(400).send("Valor ou Litros inválidos.");
    }

    // 4. Checa o estoque
    if (estoqueAtual < litrosVendidos) {
      return res.status(400).send("Estoque insuficiente.");
    }

    // 5. Deduz o estoque
    await pool.execute(
      "UPDATE combustiveis SET estoque_litros = estoque_litros - ? WHERE id = ?",
      [litrosVendidos, combustivel_id]
    );

    // 6. REGISTRA A VENDA (com o valorVenda calculado, seja promo ou não)
    await pool.execute(
      `INSERT INTO vendas (frentista_id, turno_id, combustivel_id, valor_venda, tipo_venda) 
       VALUES (?, ?, ?, ?, 'combustivel')`,
      [frentista_id, turno_id, combustivel_id, valorVenda]
    );
    
    res.redirect('/venda-combustivel'); 
    
  } catch (err) {
    next(err);
  }
};