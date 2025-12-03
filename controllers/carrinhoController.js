const pool = require('../db');

exports.show = async (req, res, next) => {
  try {
    const [carrinho] = await pool.query(
      'SELECT * FROM carrinho WHERE id_usuario = ?',
      [req.params.id]
    );
    const [products] = await pool.query(
      'SELECT * FROM products ORDER BY createdAt DESC'
    );
    //if (rows.length === 0) return res.status(404).send('Produto não encontrado');
    res.render('carrinho', { carrinho, products });
  } catch (err) {
    next(err);
  }
};

exports.add = async (req, res, next) => {
  const [carrinho] = await pool.query(
    'SELECT * FROM carrinho'
  );
  /*carrinho.forEach(async (c)=>{
      if (req.params.id == c.id_usuario && req.params.id2==c.id_products){
          c.quantidade=c.quantidade+1;
            await pool.execute(
                `UPDATE carrinho
                    SET quantidade=?
                  WHERE id = ?`,
                [c.quantidade , c.id ]
            );
            
            try {
                const [carrinho] = await pool.query(
                  'SELECT * FROM carrinho WHERE id_usuario = ?',
                  [req.params.id]
                );
                const [products] = await pool.query(
                  'SELECT * FROM products ORDER BY createdAt DESC'
                );
                //if (rows.length === 0) return res.status(404).send('Produto não encontrado');
                res.render('carrinho', { carrinho, products });
            } catch (err) {
                next(err);
            }
      }
      
      
  }
  );*/


  try {

    // 1) Pegue do body e atribua valores padrão caso venha undefined
    const id_usuario = req.params.id;
    const id_products = req.params.id2;
    // Converta para número ou 0
    
    
    // 2) Agora envie valores SEM undefined
    await pool.execute(
      `INSERT INTO carrinho
        (id_usuario, id_products)
       VALUES (?, ?)`,
      [id_usuario,id_products]
    );
    
    
  
    
  } catch (err) {
    next(err);
  }
  try {
    const [carrinho] = await pool.query(
      'SELECT * FROM carrinho WHERE id_usuario = ?',
      [req.params.id]
    );
    const [products] = await pool.query(
      'SELECT * FROM products ORDER BY createdAt DESC'
    );
    //if (rows.length === 0) return res.status(404).send('Produto não encontrado');
    res.render('carrinho', { carrinho, products });
  } catch (err) {
    next(err);
  }
};

exports.add2 = async (req, res, next) => {
  const [carrinho] = await pool.query(
    'SELECT * FROM carrinho'
  );
  /*carrinho.forEach(async (c)=>{
      if (req.params.id == c.id_usuario && req.params.id2==c.id_products){
          c.quantidade=c.quantidade+req.body.quantity;
            await pool.execute(
                `UPDATE carrinho
                    SET quantidade=?
                  WHERE id = ?`,
                [c.quantidade , c.id ]
            );
            
            try {
                const [carrinho] = await pool.query(
                  'SELECT * FROM carrinho WHERE id_usuario = ?',
                  [req.params.id]
                );
                const [products] = await pool.query(
                  'SELECT * FROM products ORDER BY createdAt DESC'
                );
                //if (rows.length === 0) return res.status(404).send('Produto não encontrado');
                res.render('carrinho', { carrinho, products });
            } catch (err) {
                next(err);
            }
      }
      
      
  }
  );*/


  try {

    // 1) Pegue do body e atribua valores padrão caso venha undefined
    const id_usuario = req.params.id;
    const id_products = req.params.id2;
    // Converta para número ou 0
    
    
    // 2) Agora envie valores SEM undefined
    await pool.execute(
      `INSERT INTO carrinho
        (id_usuario, id_products)
       VALUES (?, ?)`,
      [id_usuario,id_products]
    );
    
    
  
    
  } catch (err) {
    next(err);
  }
  try {
    const [carrinho] = await pool.query(
      'SELECT * FROM carrinho WHERE id_usuario = ?',
      [req.params.id]
    );
    const [products] = await pool.query(
      'SELECT * FROM products ORDER BY createdAt DESC'
    );
    //if (rows.length === 0) return res.status(404).send('Produto não encontrado');
    res.render('carrinho', { carrinho, products });
  } catch (err) {
    next(err);
  }
};

// controllers/carrinhoController.js

exports.comprar = async (req, res, next) => {
  
  // --- NOSSOS DADOS DA VENDA ---
  const id_produto = req.params.id;
  const id_cliente = req.params.id2; // O ID do cliente (dono do carrinho)
  const id_frentista = req.session.usuario.id; // O ID do funcionário (da sessão)
  
  // <-- MUDANÇA 1: Pega o ID do turno que está aberto na sessão
  const id_turno = req.session.turno_id; 
  // --- FIM DOS DADOS ---

  try {
    // 1. Busca o produto (para pegar o preço e checar o estoque)
    const [compra] = await pool.query(
      'SELECT * FROM products WHERE id = ?', [id_produto]
    );

    if (compra.length === 0) {
      return res.status(404).send('Produto não encontrado');
    }

    const produto = compra[0];
    const preco_do_item = produto.price; 

    if (produto.stock <= 0) {
      return res.status(400).send('Produto sem estoque.');
    }

    // 2. Atualiza o estoque (decrementa 1)
    await pool.execute(
      `UPDATE products
       SET stock = stock - 1
       WHERE id = ?`,
      [id_produto]
    );

    // 3. *** ESTA É A NOVA LÓGICA ***
    //     Insere o registro da venda na nova tabela 'vendas'
    
    // <-- MUDANÇA 2: Adiciona a coluna 'turno_id' no INSERT
    await pool.execute(
      `INSERT INTO vendas 
        (frentista_id, cliente_id, produto_id, valor_venda, turno_id) 
       VALUES (?, ?, ?, ?, ?)`, // <-- 5 interrogações
      [id_frentista, id_cliente, id_produto, preco_do_item, id_turno] // <-- 5 valores
    );
    // ******************************************************

    // 4. Limpa o item do carrinho
    await pool.execute(
      'DELETE FROM carrinho WHERE id_products = ? AND id_usuario = ? LIMIT 1', 
      [id_produto, id_cliente]
    );

    // 5. Mostra a tela de sucesso
    res.render('comprado'); // (Sua tela de "Venda Realizada")

  } catch (err) {
    console.error(err);
    next(err);
  }
};

// controllers/carrinhoController.js

// 1. [NOVA FUNÇÃO] Mostra a tela de seleção de pagamento
exports.telaPagamento = async (req, res, next) => {
  try {
    const id_cliente = req.params.id;

    // Busca itens para calcular o total
    // [CORREÇÃO] Removemos 'c.quantidade' da query pois ela não existe na tabela
    const [itens] = await pool.query(
      `SELECT p.price 
       FROM carrinho c 
       JOIN products p ON c.id_products = p.id 
       WHERE c.id_usuario = ?`,
      [id_cliente]
    );

    if (itens.length === 0) return res.redirect('/carrinho/' + id_cliente);

    // Calcula total
    let total = 0;
    itens.forEach(item => {
      // [CORREÇÃO] Como não tem quantidade, apenas somamos o preço de cada linha
      total += parseFloat(item.price); 
    });

    res.render('pagamento/selecao', { 
      titulo: 'Pagamento',
      total: total.toFixed(2),
      id_cliente: id_cliente
    });

  } catch (err) {
    next(err);
  }
};

// 2. [ATUALIZAÇÃO] O seu checkoutCarrinho agora recebe o método
exports.checkoutCarrinho = async (req, res, next) => {
  const connection = await pool.getConnection(); // Usaremos conexão dedicada para transação
  try {
    const id_cliente = req.params.id; 
    const id_frentista = req.session.usuario.id;
    const id_turno = req.session.turno_id;
    const { metodo_pagamento } = req.body; 

    // Inicia transação (segurança para não dar erro no meio do caminho)
    await connection.beginTransaction();

    const [itensDoCarrinho] = await connection.query(
      `SELECT c.id_products, c.id_usuario, p.price, p.name
       FROM carrinho c
       JOIN products p ON c.id_products = p.id
       WHERE c.id_usuario = ?`,
      [id_cliente]
    );

    if (itensDoCarrinho.length === 0) {
      await connection.release();
      return res.redirect('/carrinho/' + id_cliente);
    }

    // Processa a venda item por item
    for (const item of itensDoCarrinho) {
      
      // 1. Registra a venda na tabela 'vendas'
      await connection.execute(
        `INSERT INTO vendas 
          (frentista_id, cliente_id, produto_id, valor_venda, turno_id, metodo_pagamento) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id_frentista, id_cliente, item.id_products, item.price, id_turno, metodo_pagamento]
      );

      // 2. VERIFICAÇÃO DE INSUMOS (A Mágica da US-07)
      // Verifica se este produto é um "Serviço" que consome outros produtos
      const [insumos] = await connection.query(
        'SELECT * FROM servico_insumos WHERE servico_id = ?', 
        [item.id_products]
      );

      if (insumos.length > 0) {
        // CENÁRIO A: É um serviço (Ex: Troca de Óleo)
        // Não baixamos o estoque do serviço, baixamos os insumos vinculados
        for (let insumo of insumos) {
           await connection.execute(
             'UPDATE products SET stock = stock - ? WHERE id = ?',
             [insumo.quantidade, insumo.insumo_id]
           );
        }
      } else {
        // CENÁRIO B: É um produto normal (Ex: Coca Cola ou Litro de Óleo avulso)
        // Baixa o estoque dele mesmo
        await connection.execute(
          'UPDATE products SET stock = stock - 1 WHERE id = ?',
          [item.id_products]
        );
      }
    }

    // Limpa o carrinho
    await connection.execute('DELETE FROM carrinho WHERE id_usuario = ?', [id_cliente]);

    await connection.commit(); // Salva tudo
    res.render('comprado'); 

  } catch (err) {
    await connection.rollback(); // Desfaz se der erro
    console.error(err);
    next(err);
  } finally {
    connection.release(); // Libera a conexão
  }
};


exports.removerItem = async (req, res, next) => {
  try {
    // 1. Pega os IDs da URL
    const id_produto = req.params.id;
    const id_cliente = req.params.id2;

    // 2. Deleta apenas UM item do carrinho
    // (Exatamente como o 'comprar' faz, mas sem o resto da lógica)
    await pool.execute(
      'DELETE FROM carrinho WHERE id_products = ? AND id_usuario = ? LIMIT 1',
      [id_produto, id_cliente]
    );

    // 3. Redireciona de volta para a tela do carrinho
    res.redirect('/carrinho/' + id_cliente);

  } catch (err) {
    console.error(err);
    next(err);
  }
};