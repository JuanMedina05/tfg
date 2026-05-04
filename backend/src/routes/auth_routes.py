from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.models import db, User, Role
from schemas.schemas import user_schema
import bcrypt

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/register', methods=['POST'])
@jwt_required()
def register():
    """Registrar un nuevo usuario (solo admin)"""
    # Solo el admin puede crear usuarios
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))
    if current_user.rol_id != 1:
        return jsonify({'error': 'Solo el administrador puede crear usuarios'}), 403

    data = request.get_json()

    # Validar campos obligatorios
    required_fields = ['nombre', 'num_colegiado', 'password']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'El campo "{field}" es obligatorio'}), 400

    # Comprobar si el num_colegiado ya existe
    if User.query.filter_by(num_colegiado=data['num_colegiado']).first():
        return jsonify({'error': 'El número de colegiado ya está registrado'}), 409

    # Validar que el rol existe
    rol_id = data.get('rol_id', 2)  # Por defecto rol 2 (veterinario)
    role = Role.query.get(rol_id)
    if not role:
        return jsonify({'error': 'El rol especificado no existe'}), 400

    # Hash de la contraseña
    hashed_password = bcrypt.hashpw(
        data['password'].encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')

    # Crear usuario
    new_user = User(
        nombre=data['nombre'],
        apodo=data.get('apodo', ''),
        telefono=data.get('telefono', ''),
        num_colegiado=data['num_colegiado'],
        password=hashed_password,
        rol_id=rol_id
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        'message': 'Usuario registrado correctamente',
        'user': user_schema.dump(new_user)
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Iniciar sesión con número de colegiado y contraseña"""
    data = request.get_json()

    if not data or not data.get('num_colegiado') or not data.get('password'):
        return jsonify({'error': 'Número de colegiado y contraseña son obligatorios'}), 400

    user = User.query.filter_by(num_colegiado=data['num_colegiado']).first()
    if not user:
        return jsonify({'error': 'Credenciales inválidas'}), 401

    # Verificar contraseña
    if not bcrypt.checkpw(
        data['password'].encode('utf-8'),
        user.password.encode('utf-8')
    ):
        return jsonify({'error': 'Credenciales inválidas'}), 401

    # Crear token JWT con identidad del usuario
    try:
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={
                'num_colegiado': user.num_colegiado,
                'rol_id': user.rol_id
            }
        )

        user_data = {
            'id': user.id,
            'nombre': user.nombre,
            'apodo': user.apodo or '',
            'telefono': user.telefono or '',
            'num_colegiado': user.num_colegiado,
            'rol_id': user.rol_id,
        }

        return jsonify({
            'message': 'Login exitoso',
            'access_token': access_token,
            'user': user_data
        }), 200
    except Exception as e:
        return jsonify({'error': f'Error interno al generar el token: {str(e)}'}), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Obtener datos del usuario autenticado"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    return jsonify({
        'user': user_schema.dump(user)
    }), 200
