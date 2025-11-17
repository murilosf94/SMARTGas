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
        const id_usuario       = req.params.id;
        const id_products      = req.params.id2;
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
        const id_usuario       = req.params.id;
        const id_products      = req.params.id2;
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
    await pool.execute(
      `INSERT INTO vendas 
        (frentista_id, cliente_id, produto_id, valor_venda) 
       VALUES (?, ?, ?, ?)`,
      [id_frentista, id_cliente, id_produto, preco_do_item]
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

  