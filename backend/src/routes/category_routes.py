from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.models import db, Category
from schemas.schemas import category_schema, categories_schema

categories_bp = Blueprint('categories', __name__, url_prefix='/api/categories')


@categories_bp.route('', methods=['GET'])
@jwt_required()
def get_categories():
    """Listar todas las categorías"""
    categories = Category.query.all()
    return jsonify(categories_schema.dump(categories)), 200


@categories_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_category(id):
    """Obtener una categoría por ID"""
    category = Category.query.get(id)
    if not category:
        return jsonify({'error': 'Categoría no encontrada'}), 404
    return jsonify(category_schema.dump(category)), 200


@categories_bp.route('', methods=['POST'])
@jwt_required()
def create_category():
    """Crear una nueva categoría"""
    data = request.get_json()

    if not data or not data.get('nombre'):
        return jsonify({'error': 'El campo "nombre" es obligatorio'}), 400

    new_category = Category(nombre=data['nombre'])
    db.session.add(new_category)
    db.session.commit()

    return jsonify({
        'message': 'Categoría creada correctamente',
        'category': category_schema.dump(new_category)
    }), 201


@categories_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_category(id):
    """Actualizar una categoría"""
    category = Category.query.get(id)
    if not category:
        return jsonify({'error': 'Categoría no encontrada'}), 404

    data = request.get_json()
    if data.get('nombre'):
        category.nombre = data['nombre']

    db.session.commit()
    return jsonify({
        'message': 'Categoría actualizada correctamente',
        'category': category_schema.dump(category)
    }), 200


@categories_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_category(id):
    """Eliminar una categoría"""
    category = Category.query.get(id)
    if not category:
        return jsonify({'error': 'Categoría no encontrada'}), 404

    # Verificar que no haya productos asociados
    if category.productos:
        return jsonify({
            'error': 'No se puede eliminar la categoría porque tiene productos asociados'
        }), 409

    db.session.delete(category)
    db.session.commit()
    return jsonify({'message': 'Categoría eliminada correctamente'}), 200
