var createError      = require('http-errors');
var express          = require('express');
var path             = require('path');
var cookieParser     = require('cookie-parser');
var logger           = require('morgan');
var session          = require('express-session');
var methodOverride   = require('method-override');

// Conexão com pool MySQL via db.js
const pool           = require('./db');


// Importa rotas
var indexRouter      = require('./routes/index');
var usersRouter      = require('./routes/users');
var produtosRouter   = require('./routes/nossosprodutos');
var acessoriosRouter = require('./routes/categorias/acessorios');
var roupasRouter     = require('./routes/categorias/roupas');
var eletronicosRouter= require('./routes/categorias/eletronicos');
var carrinhoRouter   = require('./routes/carrinho');
var pedidosRouter    = require('./routes/pedidos');
var anunciarRouter   = require('./routes/anunciar');
var dashboardadminRouter = require('./routes/dashboardadmin');
var meuperfilRouter  = require('./routes/perfil');
var clientesRouter = require('./routes/clientesRoutes');
var fornecedoresRouter = require('./routes/fornecedoresRoutes');
var despesasRouter  = require('./routes/despesas');
const authRoutes     = require('./routes/authroute');
var adminUsuariosRouter = require('./routes/adminUsuariosRoutes');
const { estaLogado, eAdmin } = require('./middleware/authmiddleware');
var productsRouter   = require('./routes/products');  // CRUD de produtos
var turnoRouter = require('./routes/turnoRoutes');
var combustiveisRouter = require('./routes/combustiveisRoutes');
var vendaCombustivelRouter = require('./routes/vendaCombustivelRoutes');
var manutencaoRouter = require('./routes/manutencaoRoutes');
// --- [NOVO IMPORT] ---
var relatorioRouter = require('./routes/relatorioRoutes'); 

//const { estaLogado, eAdmin } = require('./middleware/authmiddleware');
const { precisaDeTurnoAberto } = require('./middleware/turnoMiddleware');

var app = express();

//Css set
app.use('/css', express.static('stylesheets/form.css'));
app.use('/css', express.static('stylesheets/login.css'));
app.use('/css', express.static('stylesheets/product.css'));
app.use('/css', express.static('stylesheets/style.css'));


app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


// View engine setup (Jade)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Logger HTTP (morgan)
app.use(logger('dev'));

// Parsers de corpo
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Suporte a método override para PUT/DELETE via forms
app.use(methodOverride('_method'));

// Logger custom para depuração de rotas e corpos
app.use((req, res, next) => {
  console.log(`→ Método: ${req.method} | URL: ${req.url} | Body:`, req.body);
  next();
});

// Outros middlewares
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({                                 
  secret: 'umSegredoBemSecreto',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hora
}));
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Rotas de autenticação
app.use(authRoutes);

// Rotas públicas
app.use('/', indexRouter);
app.use('/nossosprodutos', produtosRouter);
app.use('/categorias/acessorios', acessoriosRouter);
app.use('/categorias/roupas', roupasRouter);
app.use('/categorias/eletronicos', eletronicosRouter);

// CRUD de produtos
app.use('/products', estaLogado, productsRouter);

// Rotas protegidas
app.use('/turno', turnoRouter); 
app.use('/users', estaLogado, usersRouter);
app.use('/carrinho', estaLogado, precisaDeTurnoAberto, carrinhoRouter);
app.use('/clientes', estaLogado, precisaDeTurnoAberto, clientesRouter);
app.use('/pedidos', estaLogado, pedidosRouter);
app.use('/anunciar', estaLogado, precisaDeTurnoAberto, anunciarRouter);
app.use('/perfil', estaLogado, meuperfilRouter);
app.use('/despesas', estaLogado, precisaDeTurnoAberto, despesasRouter);
app.use('/fornecedores', estaLogado, fornecedoresRouter);
app.use('/venda-combustivel', estaLogado, precisaDeTurnoAberto, vendaCombustivelRouter);
app.use('/combustiveis', estaLogado, combustiveisRouter);


// Rota admin
app.get('/admin', estaLogado, eAdmin, (req, res) => {
  res.render('admin', { usuario: req.session.usuario });
});
app.use('/dashboardadmin', estaLogado, eAdmin, dashboardadminRouter);

app.use('/admin-usuarios', estaLogado, eAdmin, adminUsuariosRouter);

app.use('/manutencao', manutencaoRouter);

// --- [NOVO USO DA ROTA] ---
// Adicionada aqui junto com as outras rotas de admin
app.use('/relatorios', estaLogado, eAdmin, relatorioRouter);


// Exemplo de consulta direta usando pool
app.get('/select', estaLogado, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios');
    res.json(rows);
  } catch (err) {
    res.status(500).send('Erro na consulta');
  }
});

// catch 404 e forward para error handler
app.use((req, res, next) => next(createError(404)));

// error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error   = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Inicia o servidor
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));

module.exports = app;