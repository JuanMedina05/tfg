from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.models import db, Order, OrderItem, Product, User
from schemas.schemas import order_schema, orders_schema

orders_bp = Blueprint('orders', __name__, url_prefix='/api/orders')


@orders_bp.route('', methods=['GET'])
@jwt_required()
def get_orders():
    """
    Listar pedidos.
    - Si el usuario es admin (rol_id=1), devuelve todos los pedidos.
    - Si no, devuelve solo los pedidos del usuario autenticado.
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))

    if current_user.rol_id == 1:
        orders = Order.query.order_by(Order.fecha.desc()).all()
    else:
        orders = Order.query.filter_by(usuario_id=int(current_user_id)) \
            .order_by(Order.fecha.desc()).all()

    return jsonify(orders_schema.dump(orders)), 200


@orders_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_order(id):
    """Obtener un pedido con su detalle"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))

    order = Order.query.get(id)
    if not order:
        return jsonify({'error': 'Pedido no encontrado'}), 404

    # Solo el dueño del pedido o un admin puede verlo
    if order.usuario_id != int(current_user_id) and current_user.rol_id != 1:
        return jsonify({'error': 'No tienes permiso para ver este pedido'}), 403

    return jsonify(order_schema.dump(order)), 200


@orders_bp.route('', methods=['POST'])
@jwt_required()
def create_order():
    """
    Crear un nuevo pedido con items.
    Body esperado:
    {
        "items": [
            {"producto_id": 1, "cantidad": 2},
            {"producto_id": 3, "cantidad": 1}
        ]
    }
    El precio se calcula automáticamente según el rol del usuario:
    - Veterinario (rol_id=3): precio_profesional
    - Otros: precio_publico
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))
    data = request.get_json()

    if not data or not data.get('items') or len(data['items']) == 0:
        return jsonify({'error': 'El pedido debe contener al menos un item'}), 400

    # Crear el pedido
    new_order = Order(
        usuario_id=int(current_user_id),
        estado='pendiente',
        total=0
    )
    db.session.add(new_order)
    db.session.flush()  # Obtener el ID sin hacer commit

    total = 0
    for item_data in data['items']:
        producto = Product.query.get(item_data.get('producto_id'))
        if not producto:
            db.session.rollback()
            return jsonify({
                'error': f'Producto con ID {item_data.get("producto_id")} no encontrado'
            }), 404

        cantidad = item_data.get('cantidad', 1)

        # Verificar stock
        if producto.stock < cantidad:
            db.session.rollback()
            return jsonify({
                'error': f'Stock insuficiente para "{producto.nombre}". '
                         f'Disponible: {producto.stock}, Solicitado: {cantidad}'
            }), 400

        # Determinar precio según rol del usuario
        # Rol 3 = veterinario → precio profesional
        if current_user.rol_id == 3:
            precio = float(producto.precio_profesional)
        else:
            precio = float(producto.precio_publico)

        order_item = OrderItem(
            pedido_id=new_order.id,
            producto_id=producto.id,
            cantidad=cantidad,
            precio_unitario_aplicado=precio
        )
        db.session.add(order_item)

        # Actualizar stock
        producto.stock -= cantidad
        total += precio * cantidad

    new_order.total = round(total, 2)
    db.session.commit()

    return jsonify({
        'message': 'Pedido creado correctamente',
        'order': order_schema.dump(new_order)
    }), 201


@orders_bp.route('/<int:id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(id):
    """
    Cambiar el estado de un pedido.
    Estados válidos: pendiente, pagado, enviado, cancelado
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))

    order = Order.query.get(id)
    if not order:
        return jsonify({'error': 'Pedido no encontrado'}), 404

    # Solo el admin puede cambiar estado
    if current_user.rol_id != 1:
        return jsonify({'error': 'No tienes permiso para cambiar el estado'}), 403

    data = request.get_json()
    new_status = data.get('estado')

    valid_statuses = ['pendiente', 'pagado', 'enviado', 'cancelado']
    if new_status not in valid_statuses:
        return jsonify({
            'error': f'Estado inválido. Estados válidos: {", ".join(valid_statuses)}'
        }), 400

    # Si se cancela, devolver stock
    if new_status == 'cancelado' and order.estado != 'cancelado':
        for item in order.items:
            producto = Product.query.get(item.producto_id)
            if producto:
                producto.stock += item.cantidad

    order.estado = new_status
    db.session.commit()

    return jsonify({
        'message': f'Estado del pedido actualizado a "{new_status}"',
        'order': order_schema.dump(order)
    }), 200


@orders_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_order(id):
    """Cancelar/eliminar un pedido (solo si está pendiente)"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(int(current_user_id))

    order = Order.query.get(id)
    if not order:
        return jsonify({'error': 'Pedido no encontrado'}), 404

    # Solo el dueño o un admin pueden cancelar
    if order.usuario_id != int(current_user_id) and current_user.rol_id != 1:
        return jsonify({'error': 'No tienes permiso para cancelar este pedido'}), 403

    # Solo se pueden cancelar pedidos pendientes
    if order.estado != 'pendiente':
        return jsonify({
            'error': 'Solo se pueden cancelar pedidos en estado "pendiente"'
        }), 400

    # Devolver stock
    for item in order.items:
        producto = Product.query.get(item.producto_id)
        if producto:
            producto.stock += item.cantidad

    # Eliminar items y luego el pedido
    OrderItem.query.filter_by(pedido_id=order.id).delete()
    db.session.delete(order)
    db.session.commit()

    return jsonify({'message': 'Pedido cancelado y eliminado correctamente'}), 200
