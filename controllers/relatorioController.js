const pool = require('../db');

exports.painelRentabilidade = async (req, res, next) => {
  try {
    // Busca dados agrupados de vendas de combustível
    const [dados] = await pool.query(`
      SELECT 
        c.nome,
        SUM(v.valor_venda) as faturamento,
        SUM(v.quantidade) as total_litros,
        c.custo_por_litro
      FROM vendas v
      JOIN combustiveis c ON v.combustivel_id = c.id
      WHERE v.tipo_venda = 'combustivel'
      GROUP BY c.id, c.nome, c.custo_por_litro
    `);

    const labels = [];
    const dataReceita = [];
    const dataCusto = [];
    const dataLucro = [];

    dados.forEach(item => {
      const receita = parseFloat(item.faturamento);
      const custoUnitario = parseFloat(item.custo_por_litro);
      const litros = parseFloat(item.total_litros);
      
      const custoTotal = litros * custoUnitario;
      const lucro = receita - custoTotal;

      labels.push(item.nome);
      dataReceita.push(receita.toFixed(2));
      dataCusto.push(custoTotal.toFixed(2));
      dataLucro.push(lucro.toFixed(2));
    });

    res.render('relatorios/rentabilidade', { 
      titulo: 'Análise de Rentabilidade',
      labels: JSON.stringify(labels),
      receita: JSON.stringify(dataReceita),
      custo: JSON.stringify(dataCusto),
      lucro: JSON.stringify(dataLucro)
    });

  } catch (err) {
    next(err);
  }
};