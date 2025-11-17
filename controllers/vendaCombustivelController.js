// controllers/vendaCombustivelController.js
const pool = require('../db');

// MOSTRA A PÁGINA DE VENDA COM OS PREÇOS
exports.mostrarTelaVenda = async (req, res, next) => {
  try {
    const [combustiveis] = await pool.query("SELECT * FROM combustiveis");
    
    const combustiveisComAlerta = combustiveis.map(c => ({
      ...c,
      estoqueBaixo: parseFloat(c.estoque_litros) <= parseFloat(c.estoque_minimo_litros)
    }));
    
    // Passamos os combustíveis (com preços) para o Jade
    res.render('venda-combustivel/index', { combustiveis: combustiveisComAlerta });
  } catch (err) {
    next(err);
  }
};

// PROCESSA A VENDA (O CORAÇÃO DA LÓGICA)
exports.registrarVenda = async (req, res, next) => {
  try {
    const { combustivel_id, valor_reais, valor_litros } = req.body;
    const { id: frentista_id, funcao: frentista_funcao } = req.session.usuario;
    const turno_id = req.session.turno_id; // (Pega do turno que abrimos!)

    // 1. Pega o preço atual do combustível no banco (para segurança)
    const [rows] = await pool.query(
      "SELECT preco_por_litro, estoque_litros FROM combustiveis WHERE id = ?",
      [combustivel_id]
    );
    const precoLitro = parseFloat(rows[0].preco_por_litro);
    const estoqueAtual = parseFloat(rows[0].estoque_litros);

    let litrosVendidos = 0;
    let valorVenda = 0;

    // 2. A LÓGICA DE CONVERSÃO (que você pediu)
    if (valor_reais && parseFloat(valor_reais) > 0) {
      // Se vendeu por REAIS (Ex: R$ 50,00)
      valorVenda = parseFloat(valor_reais);
      litrosVendidos = valorVenda / precoLitro;
    } else if (valor_litros && parseFloat(valor_litros) > 0) {
      // Se vendeu por LITROS (Ex: 20 L)
      litrosVendidos = parseFloat(valor_litros);
      valorVenda = litrosVendidos * precoLitro;
    } else {
      return res.status(400).send("Valor ou Litros inválidos.");
    }

    // 3. Checa o estoque
    if (estoqueAtual < litrosVendidos) {
      // (Idealmente, redirecionar com msg de erro)
      return res.status(400).send("Estoque insuficiente.");
    }

    // 4. Deduz o estoque
    await pool.execute(
      "UPDATE combustiveis SET estoque_litros = estoque_litros - ? WHERE id = ?",
      [litrosVendidos, combustivel_id]
    );

    // 5. REGISTRA A VENDA (na nossa tabela 'vendas' modificada)
    await pool.execute(
      `INSERT INTO vendas (frentista_id, turno_id, combustivel_id, valor_venda, tipo_venda) 
       VALUES (?, ?, ?, ?, 'combustivel')`,
      [frentista_id, turno_id, combustivel_id, valorVenda]
    );
    
    // (Opcional: redirecionar para uma tela de "venda concluída")
    res.redirect('/venda-combustivel'); 
    
  } catch (err) {
    next(err);
  }
};