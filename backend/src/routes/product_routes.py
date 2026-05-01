from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.models import db, Product
from schemas.schemas import product_schema, products_schema

products_bp = Blueprint('products', __name__, url_prefix='/api/products')


@products_bp.route('', methods=['GET'])
def get_products():
    """
    Listar productos con paginación y filtro por categoría.
    Query params:
        - page (int): número de página (default 1)
        - per_page (int): productos por página (default 20)
        - categoria_id (int): filtrar por categoría
        - search (str): buscar por nombre
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    categoria_id = request.args.get('categoria_id', type=int)
    search = request.args.get('search', type=str)

    query = Product.query

    if categoria_id:
        query = query.filter_by(categoria_id=categoria_id)
    if search:
        query = query.filter(Product.nombre.ilike(f'%{search}%'))

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'products': products_schema.dump(pagination.items),
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': pagination.page
    }), 200


@products_bp.route('/<int:id>', methods=['GET'])
def get_product(id):
    """Obtener un producto por ID"""
    product = Product.query.get(id)
    if not product:
        return jsonify({'error': 'Producto no encontrado'}), 404
    return jsonify(product_schema.dump(product)), 200


@products_bp.route('', methods=['POST'])
@jwt_required()
def create_product():
    """Crear un nuevo producto"""
    data = request.get_json()

    required_fields = ['nombre', 'precio_publico', 'precio_profesional']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'El campo "{field}" es obligatorio'}), 400

    new_product = Product(
        nombre=data['nombre'],
        descripcion=data.get('descripcion', ''),
        precio_publico=data['precio_publico'],
        precio_profesional=data['precio_profesional'],
        stock=data.get('stock', 0),
        categoria_id=data.get('categoria_id'),
        imagen_url=data.get('imagen_url')
    )

    db.session.add(new_product)
    db.session.commit()

    return jsonify({
        'message': 'Producto creado correctamente',
        'product': product_schema.dump(new_product)
    }), 201


@products_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_product(id):
    """Actualizar un producto"""
    product = Product.query.get(id)
    if not product:
        return jsonify({'error': 'Producto no encontrado'}), 404

    data = request.get_json()

    if data.get('nombre'):
        product.nombre = data['nombre']
    if data.get('descripcion') is not None:
        product.descripcion = data['descripcion']
    if data.get('precio_publico') is not None:
        product.precio_publico = data['precio_publico']
    if data.get('precio_profesional') is not None:
        product.precio_profesional = data['precio_profesional']
    if data.get('stock') is not None:
        product.stock = data['stock']
    if data.get('categoria_id') is not None:
        product.categoria_id = data['categoria_id']
    if data.get('imagen_url') is not None:
        product.imagen_url = data['imagen_url']

    db.session.commit()
    return jsonify({
        'message': 'Producto actualizado correctamente',
        'product': product_schema.dump(product)
    }), 200


@products_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_product(id):
    """Eliminar un producto"""
    product = Product.query.get(id)
    if not product:
        return jsonify({'error': 'Producto no encontrado'}), 404

    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Producto eliminado correctamente'}), 200
