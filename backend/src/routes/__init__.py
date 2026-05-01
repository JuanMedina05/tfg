from routes.auth_routes import auth_bp
from routes.role_routes import roles_bp
from routes.user_routes import users_bp
from routes.category_routes import categories_bp
from routes.product_routes import products_bp
from routes.order_routes import orders_bp


def register_blueprints(app):
    """Registrar todos los Blueprints en la app Flask"""
    app.register_blueprint(auth_bp)
    app.register_blueprint(roles_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(categories_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(orders_bp)
