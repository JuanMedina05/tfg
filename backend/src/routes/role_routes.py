from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.models import db, Role
from schemas.schemas import role_schema, roles_schema

roles_bp = Blueprint('roles', __name__, url_prefix='/api/roles')


@roles_bp.route('', methods=['GET'])
def get_roles():
    """Listar todos los roles"""
    roles = Role.query.all()
    return jsonify(roles_schema.dump(roles)), 200


@roles_bp.route('/<int:id>', methods=['GET'])
def get_role(id):
    """Obtener un rol por ID"""
    role = Role.query.get(id)
    if not role:
        return jsonify({'error': 'Rol no encontrado'}), 404
    return jsonify(role_schema.dump(role)), 200


@roles_bp.route('', methods=['POST'])
@jwt_required()
def create_role():
    """Crear un nuevo rol"""
    data = request.get_json()

    if not data or not data.get('nombre'):
        return jsonify({'error': 'El campo "nombre" es obligatorio'}), 400

    new_role = Role(nombre=data['nombre'])
    db.session.add(new_role)
    db.session.commit()

    return jsonify({
        'message': 'Rol creado correctamente',
        'role': role_schema.dump(new_role)
    }), 201


@roles_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_role(id):
    """Actualizar un rol"""
    role = Role.query.get(id)
    if not role:
        return jsonify({'error': 'Rol no encontrado'}), 404

    data = request.get_json()
    if data.get('nombre'):
        role.nombre = data['nombre']

    db.session.commit()
    return jsonify({
        'message': 'Rol actualizado correctamente',
        'role': role_schema.dump(role)
    }), 200


@roles_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_role(id):
    """Eliminar un rol"""
    role = Role.query.get(id)
    if not role:
        return jsonify({'error': 'Rol no encontrado'}), 404

    db.session.delete(role)
    db.session.commit()
    return jsonify({'message': 'Rol eliminado correctamente'}), 200
