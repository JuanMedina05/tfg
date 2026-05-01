from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    # Relación para ver qué usuarios tienen este rol
    usuarios = db.relationship('User', backref='role', lazy=True)

    def __repr__(self):
        return f'<Role {self.nombre}>'


class User(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellidos = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    direccion = db.Column(db.Text, nullable=True)
    num_colegiado = db.Column(db.String(50), nullable=True)
    rol_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    pedidos = db.relationship('Order', backref='cliente', lazy=True)

    def __repr__(self):
        return f'<User {self.email}>'


class Category(db.Model):
    __tablename__ = 'categorias'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    productos = db.relationship('Product', backref='categoria', lazy=True)

    def __repr__(self):
        return f'<Category {self.nombre}>'


class Product(db.Model):
    __tablename__ = 'productos'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    precio_publico = db.Column(db.Numeric(10, 2), nullable=False)
    precio_profesional = db.Column(db.Numeric(10, 2), nullable=False)
    stock = db.Column(db.Integer, default=0)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias.id'))
    imagen_url = db.Column(db.String(255), nullable=True)

    def __repr__(self):
        return f'<Product {self.nombre}>'


class Order(db.Model):
    __tablename__ = 'pedidos'
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'))
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    estado = db.Column(db.String(50), default='pendiente')
    total = db.Column(db.Numeric(10, 2))
    items = db.relationship('OrderItem', backref='pedido', lazy=True)

    def __repr__(self):
        return f'<Order {self.id}>'


class OrderItem(db.Model):
    __tablename__ = 'detalle_pedido'
    id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedidos.id'))
    producto_id = db.Column(db.Integer, db.ForeignKey('productos.id'))
    cantidad = db.Column(db.Integer, nullable=False)
    precio_unitario_aplicado = db.Column(db.Numeric(10, 2), nullable=False)
    producto = db.relationship('Product', backref='detalle_items', lazy=True)

    def __repr__(self):
        return f'<OrderItem pedido={self.pedido_id} producto={self.producto_id}>'