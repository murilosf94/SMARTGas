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