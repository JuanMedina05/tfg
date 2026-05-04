-- Crear la base de datos
SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS veterinaria_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE veterinaria_db;

-- Tabla de Roles
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

-- Tabla de Categorías
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- Tabla de Usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apodo VARCHAR(100),
    telefono VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    num_colegiado VARCHAR(50) UNIQUE NOT NULL,
    rol_id INT,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- Tabla de Productos
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio_profesional DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    categoria_id INT,
    imagen_url VARCHAR(255),
    oculto BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- Tabla de Pedidos
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente', 'en proceso', 'finalizado', 'cancelado') DEFAULT 'pendiente',
    total DECIMAL(10, 2),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla Detalle de Pedido
CREATE TABLE detalle_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT,
    producto_id INT,
    cantidad INT NOT NULL,
    precio_unitario_aplicado DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Insertar roles iniciales
INSERT INTO roles (id, nombre) VALUES (1, 'admin');
INSERT INTO roles (id, nombre) VALUES (2, 'veterinario');

-- Insertar usuario admin por defecto
-- Contraseña: admin123 (hasheada con bcrypt)
INSERT INTO usuarios (nombre, num_colegiado, password, rol_id) VALUES (
    'Administrador',
    'ADMIN001',
    '$2b$12$vw17CRW62qEJlBjHULnT9OsN.g0lgfzYsbmlApp5PiugueRPjNbUW',
    1
);

-- Insertar categorías de prueba
INSERT INTO categorias (nombre) VALUES ('Alimentación');
INSERT INTO categorias (nombre) VALUES ('Medicamentos');
INSERT INTO categorias (nombre) VALUES ('Accesorios');

-- Insertar productos de prueba
INSERT INTO productos (nombre, descripcion, precio_profesional, stock, categoria_id, imagen_url) VALUES 
('Pienso Premium Perros 15kg', 'Pienso de alta calidad para perros adultos.', 35.00, 50, 1, 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&q=80'),
('Antiparasitario Externo', 'Pipetas para perros medianos (10-20kg).', 18.00, 100, 2, 'https://images.unsplash.com/photo-1623387641168-d9804dd9fa9a?w=500&q=80'),
('Correa Reflectante', 'Correa de 2 metros con material reflectante.', 10.00, 30, 3, 'https://images.unsplash.com/photo-1602498456745-e9503b30470b?w=500&q=80'),
('Pienso Gatos Esterilizados 3kg', 'Alimento específico para control de peso.', 16.50, 40, 1, 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&q=80'),
('Champú Piel Sensible', 'Champú dermatológico con aloe vera.', 8.50, 25, 2, 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=500&q=80'),
('Transportín Rígido', 'Transportín para gatos y perros pequeños.', 25.00, 15, 3, 'https://images.unsplash.com/photo-1520560321666-4b36560e7979?w=500&q=80');