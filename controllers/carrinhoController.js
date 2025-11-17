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

exports.checkoutCarrinho = async (req, res, next) => {
  try {
    // --- 1. PEGA OS IDs ---
    // Pega o ID do Cliente (dono do carrinho) pela URL (como o 'exports.show' faz)
    const id_cliente = req.params.id; 
    
    // Pega o Frentista e o Turno da sessão
    const id_frentista = req.session.usuario.id;
    const id_turno = req.session.turno_id;

    // --- 2. BUSCA TODOS OS ITENS DO CARRINHO ---
    // (Juntamos com 'products' para pegar o preço e checar o estoque)
    const [itensDoCarrinho] = await pool.query(
      `SELECT 
         c.id_products, 
         p.price, 
         p.stock,
         p.name
       FROM carrinho c
       JOIN products p ON c.id_products = p.id
       WHERE c.id_usuario = ?`,
      [id_cliente]
    );

    // Se o carrinho estiver vazio, não faz nada
    if (itensDoCarrinho.length === 0) {
      return res.redirect('/carrinho/' + id_cliente); // Volta para o carrinho
    }

    // --- 3. VERIFICA O ESTOQUE DE TUDO (SÓ PARA GARANTIR) ---
    // (Esta lógica simples checa 1-para-1, mas não agrupa.
    // Se o carrinho tiver 5x Cokes e o estoque for 2, esta lógica
    // simples não vai pegar. Mas vamos seguir o padrão do seu 'comprar'.)
    for (const item of itensDoCarrinho) {
      if (item.stock <= 0) {
        // (Aqui você pode redirecionar com uma mensagem de erro)
        return res.status(400).send(`Produto "${item.name}" está sem estoque!`);
      }
    }

    // --- 4. PROCESSA A VENDA DE CADA ITEM (LOOP) ---
    // (Idealmente, isso seria uma "Transação" de banco, 
    // mas vamos manter simples por enquanto)
    for (const item of itensDoCarrinho) {
      
      // a. Registra a venda na tabela 'vendas'
      await pool.execute(
        `INSERT INTO vendas 
          (frentista_id, cliente_id, produto_id, valor_venda, turno_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [id_frentista, id_cliente, item.id_products, item.price, id_turno]
      );

      // b. Reduz o estoque do produto
      await pool.execute(
        `UPDATE products SET stock = stock - 1 WHERE id = ?`,
        [item.id_products]
      );
    }

    // --- 5. LIMPA O CARRINHO INTEIRO ---
    // (Se chegou até aqui, todas as vendas foram registradas)
    await pool.execute(
      'DELETE FROM carrinho WHERE id_usuario = ?', 
      [id_cliente]
    );

    // --- 6. MOSTRA A TELA DE SUCESSO ---
    res.render('comprado'); // (A mesma tela do 'exports.comprar')

  } catch (err) {
    console.error(err);
    next(err);
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