from flask_marshmallow import Marshmallow

ma = Marshmallow()


class RoleSchema(ma.Schema):
    class Meta:
        fields = ('id', 'nombre')


class UserSchema(ma.Schema):
    class Meta:
        fields = ('id', 'nombre', 'apodo', 'telefono', 'num_colegiado', 'rol_id')


class UserPublicSchema(ma.Schema):
    """Esquema público sin datos sensibles"""
    class Meta:
        fields = ('id', 'nombre', 'apodo')


class CategorySchema(ma.Schema):
    class Meta:
        fields = ('id', 'nombre')


class ProductSchema(ma.Schema):
    class Meta:
        fields = ('id', 'nombre', 'descripcion', 'precio_profesional',
                  'stock', 'categoria_id', 'imagen_url', 'oculto')


class OrderItemSchema(ma.Schema):
    class Meta:
        fields = ('id', 'pedido_id', 'producto_id', 'cantidad',
                  'precio_unitario_aplicado')


class OrderSchema(ma.Schema):
    items = ma.Nested(OrderItemSchema, many=True)

    class Meta:
        fields = ('id', 'usuario_id', 'fecha', 'estado', 'total', 'items')


# Instancias de los esquemas
role_schema = RoleSchema()
roles_schema = RoleSchema(many=True)

user_schema = UserSchema()
users_schema = UserSchema(many=True)
user_public_schema = UserPublicSchema()

category_schema = CategorySchema()
categories_schema = CategorySchema(many=True)

product_schema = ProductSchema()
products_schema = ProductSchema(many=True)

order_item_schema = OrderItemSchema()
order_items_schema = OrderItemSchema(many=True)

order_schema = OrderSchema()
orders_schema = OrderSchema(many=True)
