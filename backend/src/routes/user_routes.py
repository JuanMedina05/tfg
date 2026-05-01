from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.models import db, User
from schemas.schemas import user_schema, users_schema
import bcrypt

users_bp = Blueprint('users', __name__, url_prefix='/api/users')


@users_bp.route('', methods=['GET'])
@jwt_required()
def get_users():
    """Listar todos los usuarios"""
    users = User.query.all()
    return jsonify(users_schema.dump(users)), 200


@users_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_user(id):
    """Obtener un usuario por ID"""
    user = User.query.get(id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    return jsonify(user_schema.dump(user)), 200


@users_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_user(id):
    """Actualizar un usuario"""
    current_user_id = get_jwt_identity()
    user = User.query.get(id)

    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    # Solo el propio usuario o un admin puede editar
    current_user = User.query.get(int(current_user_id))
    if int(current_user_id) != id and current_user.rol_id != 1:
        return jsonify({'error': 'No tienes permiso para editar este usuario'}), 403

    data = request.get_json()

    if data.get('nombre'):
        user.nombre = data['nombre']
    if data.get('apellidos') is not None:
        user.apellidos = data['apellidos']
    if data.get('email'):
        # Comprobar que el nuevo email no esté en uso por otro usuario
        existing = User.query.filter_by(email=data['email']).first()
        if existing and existing.id != id:
            return jsonify({'error': 'El email ya está en uso'}), 409
        user.email = data['email']
    if data.get('direccion') is not None:
        user.direccion = data['direccion']
    if data.get('num_colegiado') is not None:
        user.num_colegiado = data['num_colegiado']
    if data.get('password'):
        user.password = bcrypt.hashpw(
            data['password'].encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')
    # Solo un admin puede cambiar el rol
    if data.get('rol_id') and current_user.rol_id == 1:
        user.rol_id = data['rol_id']

    db.session.commit()
    return jsonify({
        'message': 'Usuario actualizado correctamente',
        'user': user_schema.dump(user)
    }), 200


@users_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_user(id):
    """Eliminar un usuario"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))

    # Solo un admin puede eliminar usuarios
    if current_user.rol_id != 1:
        return jsonify({'error': 'No tienes permiso para eliminar usuarios'}), 403

    user = User.query.get(id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'Usuario eliminado correctamente'}), 200
