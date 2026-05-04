import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.models import db, Product, User
from schemas.schemas import product_schema, products_schema
from models.models import OrderItem

products_bp = Blueprint('products', __name__, url_prefix='/api/products')


@products_bp.route('', methods=['GET'])
@jwt_required()
def get_products():
    """
    Listar productos con paginación, filtro por categoría, búsqueda y ordenación.
    Query params:
        - page (int): número de página (default 1)
        - per_page (int): productos por página (default 20)
        - categoria_id (int): filtrar por categoría
        - search (str): buscar por nombre
        - sort (str): nombre_asc, nombre_desc, precio_asc, precio_desc
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    categoria_id = request.args.get('categoria_id', type=int)
    search = request.args.get('search', type=str)
    sort = request.args.get('sort', type=str)

    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))

    query = Product.query

    if current_user.rol_id != 1:
        query = query.filter_by(oculto=False)

    if categoria_id:
        query = query.filter_by(categoria_id=categoria_id)
    if search:
        query = query.filter(Product.nombre.ilike(f'%{search}%'))

    # Ordenación
    if sort == 'nombre_asc':
        query = query.order_by(Product.nombre.asc())
    elif sort == 'nombre_desc':
        query = query.order_by(Product.nombre.desc())
    elif sort == 'precio_asc':
        query = query.order_by(Product.precio_profesional.asc())
    elif sort == 'precio_desc':
        query = query.order_by(Product.precio_profesional.desc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'products': products_schema.dump(pagination.items),
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': pagination.page
    }), 200


@products_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_product(id):
    """Obtener un producto por ID"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))

    product = Product.query.get(id)
    if not product:
        return jsonify({'error': 'Producto no encontrado'}), 404
        
    if product.oculto and current_user.rol_id != 1:
        return jsonify({'error': 'Producto no disponible'}), 403

    return jsonify(product_schema.dump(product)), 200


@products_bp.route('', methods=['POST'])
@jwt_required()
def create_product():
    """Crear un nuevo producto"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))
    if current_user.rol_id != 1:
        return jsonify({'error': 'No tienes permiso para crear productos'}), 403

    # Para soportar multipart/form-data
    data = request.form.to_dict()

    required_fields = ['nombre', 'precio_profesional']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'El campo "{field}" es obligatorio'}), 400

    # Manejo de la imagen
    imagen_url = data.get('imagen_url') # Por si mandan URL directa
    if 'imagen' in request.files:
        file = request.files['imagen']
        if file and file.filename:
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4().hex}_{filename}"
            upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(upload_path)
            imagen_url = f"/uploads/{unique_filename}"

    new_product = Product(
        nombre=data['nombre'],
        descripcion=data.get('descripcion', ''),
        precio_profesional=data['precio_profesional'],
        stock=data.get('stock', 0),
        categoria_id=data.get('categoria_id'),
        imagen_url=imagen_url,
        oculto=data.get('oculto') == 'true' or data.get('oculto') is True
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
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))
    if current_user.rol_id != 1:
        return jsonify({'error': 'No tienes permiso para actualizar productos'}), 403

    product = Product.query.get(id)
    if not product:
        return jsonify({'error': 'Producto no encontrado'}), 404

    # Para soportar tanto JSON como multipart/form-data
    if request.content_type and 'multipart/form-data' in request.content_type:
        data = request.form.to_dict()
    else:
        data = request.get_json() or {}

    if data.get('nombre'):
        product.nombre = data['nombre']
    if data.get('descripcion') is not None:
        product.descripcion = data['descripcion']
    if data.get('precio_profesional') is not None:
        product.precio_profesional = data['precio_profesional']
    if data.get('stock') is not None:
        product.stock = data['stock']
    if data.get('categoria_id') is not None:
        product.categoria_id = data['categoria_id']
        
    # Manejo de la imagen
    if 'imagen' in request.files:
        file = request.files['imagen']
        if file and file.filename:
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4().hex}_{filename}"
            upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(upload_path)
            product.imagen_url = f"/uploads/{unique_filename}"
    elif data.get('imagen_url') is not None:
        product.imagen_url = data['imagen_url']

    if data.get('oculto') is not None:
        product.oculto = data['oculto'] == 'true' or data.get('oculto') is True

    db.session.commit()
    return jsonify({
        'message': 'Producto actualizado correctamente',
        'product': product_schema.dump(product)
    }), 200


@products_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_product(id):
    """Eliminar un producto"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))
    if current_user.rol_id != 1:
        return jsonify({'error': 'No tienes permiso para eliminar productos'}), 403

    product = Product.query.get(id)
    if not product:
        return jsonify({'error': 'Producto no encontrado'}), 404

    # Check if the product has orders
    has_orders = OrderItem.query.filter_by(producto_id=id).first()
    if has_orders:
        return jsonify({'error': 'No se puede borrar el producto porque ya está incluido en pedidos existentes. Por favor, ocúltalo en su lugar.'}), 400

    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Producto eliminado correctamente'}), 200
