CREATE DATABASE ecommerce;
USE ecommerce;

CREATE TABLE usuarios(
    id integer PRIMARY KEY AUTO_INCREMENT,
    usuario VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    funcao VARCHAR(255) NOT NULL,
    criado TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  imageUrl VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE carrinho(
    id integer PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    id_products INT,
    FOREIGN KEY (id_usuario) references usuarios(id),
    FOREIGN KEY (id_products) references products(id),
    
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE despesas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE fornecedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  contato VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20) NOT NULL,
  servico VARCHAR(255) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cpf VARCHAR(20) NOT NULL,
  contato VARCHAR(255) NOT NULL,
  fidelidade INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);



CREATE TABLE vendas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Quem fez a venda (o frentista/caixa logado)
  frentista_id INT, 
  
  -- Quem comprou (o dono do carrinho)
  cliente_id INT,
  
  -- O que foi vendido
  produto_id INT,
  
  -- Por quanto foi vendido
  valor_venda DECIMAL(10, 2) NOT NULL,
  
  -- Quando foi vendido
  data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- As "pontes" (Chaves Estrangeiras)
  FOREIGN KEY (frentista_id) REFERENCES usuarios(id),
  FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
  FOREIGN KEY (produto_id) REFERENCES products(id)
);


CREATE TABLE turnos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Quem abriu o turno
  frentista_id INT NOT NULL, 
  
  -- Dinheiro que tinha na gaveta quando abriu (o "troco")
  valor_inicial DECIMAL(10, 2) NOT NULL,
  
  -- Dinheiro contado na gaveta quando fechou
  valor_final DECIMAL(10, 2) NULL, -- (Pode ser nulo até fechar)
  
  -- Status do turno
  status ENUM('aberto', 'fechado') NOT NULL DEFAULT 'aberto',
  
  data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_fechamento TIMESTAMP NULL, -- (Nulo até fechar)
  
  FOREIGN KEY (frentista_id) REFERENCES usuarios(id)
);


ALTER TABLE vendas
ADD COLUMN turno_id INT NULL, -- (Pode ser nulo se quiser manter vendas antigas)
ADD FOREIGN KEY (turno_id) REFERENCES turnos(id);


ALTER TABLE despesas
ADD COLUMN frentista_id INT NULL,
ADD COLUMN turno_id INT NULL,
ADD FOREIGN KEY (frentista_id) REFERENCES usuarios(id),
ADD FOREIGN KEY (turno_id) REFERENCES turnos(id);



CREATE TABLE combustiveis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL, -- Ex: "Gasolina Comum", "Etanol"
  
  -- O preço de 1 litro (Ex: 5.499)
  preco_por_litro DECIMAL(10, 3) NOT NULL, 
  
  -- Quantos litros temos no tanque
  estoque_litros DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  
  -- O nível de alerta (para o aviso)
  estoque_minimo_litros DECIMAL(10, 2) NOT NULL DEFAULT 1000.00,
  
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insere os dois produtos que você mencionou (com preços e estoques de exemplo)
INSERT INTO combustiveis (nome, preco_por_litro, estoque_litros, estoque_minimo_litros)
VALUES 
  ('Gasolina Comum', 5.50, 10000.00, 1000.00),
  ('Etanol Comum', 3.80, 8000.00, 1000.00);


  -- 1. Torna o 'produto_id' opcional (pode ser nulo)
ALTER TABLE vendas MODIFY COLUMN produto_id INT NULL;

-- 2. Adiciona a coluna para o 'combustivel_id'
ALTER TABLE vendas
ADD COLUMN combustivel_id INT NULL,
ADD FOREIGN KEY (combustivel_id) REFERENCES combustiveis(id);

-- 3. Adiciona um 'tipo' para sabermos o que foi vendido
ALTER TABLE vendas
ADD COLUMN tipo_venda ENUM('produto', 'combustivel') NOT NULL DEFAULT 'produto';



ALTER TABLE combustiveis
ADD COLUMN preco_promocional DECIMAL(10, 3) NULL,
ADD COLUMN promo_ativo TINYINT(1) NOT NULL DEFAULT 0, -- 0 = Inativo, 1 = Ativo
ADD COLUMN promo_hora_inicio TIME NULL,              -- Ex: '14:00:00'
ADD COLUMN promo_hora_fim TIME NULL,                -- Ex: '16:00:00'
ADD COLUMN promo_dias_semana VARCHAR(15) NULL;      -- Ex: '1,2,3,4,5' (Seg-Sex)




ALTER TABLE combustiveis
  -- O "odômetro" do tanque, que acumula os litros
  ADD COLUMN total_litros_bombeados DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  
  -- O limite para disparar a manutenção (ex: 10.000 L)
  ADD COLUMN limite_manutencao_litros DECIMAL(15, 2) NOT NULL DEFAULT 10000.00,
  
  -- O gatilho do alerta (ex: 95% do limite)
  ADD COLUMN limiar_alerta_percentual DECIMAL(5, 2) NOT NULL DEFAULT 0.95, -- (95%)
  
  -- O status da manutenção (ok, alerta, manutencao_necessaria)
  ADD COLUMN status_manutencao ENUM('ok', 'alerta') NOT NULL DEFAULT 'ok';



  CREATE TABLE ordens_manutencao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- [MUDANÇA] Ligada ao 'combustivel_id', não 'bomba_id'
  combustivel_id INT NOT NULL,
  
  motivo VARCHAR(255) NOT NULL,
  status ENUM('pendente', 'concluida') NOT NULL DEFAULT 'pendente',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (combustivel_id) REFERENCES combustiveis(id)
);