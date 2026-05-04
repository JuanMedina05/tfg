from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models.models import db
from schemas.schemas import ma
from routes import register_blueprints
import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

app = Flask(__name__)

# Configuración de subidas
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configuración de seguridad
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-cambiar-en-produccion')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-cambiar-en-produccion')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Inicializar extensiones
db.init_app(app)
ma.init_app(app)
jwt = JWTManager(app)
CORS(app)

# Registrar todos los Blueprints
register_blueprints(app)

@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/')
def index():
    return {"message": "Backend conectado y modelos listos"}


# Manejo de errores JWT
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return {"error": "El token ha expirado", "code": "token_expired"}, 401


@jwt.invalid_token_loader
def invalid_token_callback(error):
    return {"error": "Token inválido", "code": "invalid_token"}, 401


@jwt.unauthorized_loader
def missing_token_callback(error):
    return {"error": "Token de autorización requerido", "code": "authorization_required"}, 401


if __name__ == '__main__':
    # Esto creará las tablas si no existen (aunque Docker ya lo hace con el init.sql)
    with app.app_context():
        db.create_all()
    
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)