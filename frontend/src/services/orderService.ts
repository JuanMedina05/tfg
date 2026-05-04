const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface OrderItemPayload {
  producto_id: number;
  cantidad: number;
}

export interface OrderPayload {
  items: OrderItemPayload[];
}

export interface OrderItem {
  id: number;
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario_aplicado: string;
}

export interface Order {
  id: number;
  usuario_id: number;
  fecha: string;
  estado: string;
  total: string;
  items: OrderItem[];
}

export const createOrder = async (token: string, payload: OrderPayload) => {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create order');
  }
  
  return response.json();
};

export const getOrders = async (token: string): Promise<Order[]> => {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch orders');
  }

  return response.json();
};

export const updateOrderStatus = async (token: string, id: number, estado: string) => {
  const response = await fetch(`${API_URL}/orders/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ estado })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al actualizar el estado del pedido');
  }

  return response.json();
};

/** Devuelve el número de pedidos que NO están finalizados ni cancelados (badge admin) */
export const getActiveOrderCount = async (token: string): Promise<number> => {
  const response = await fetch(`${API_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) return 0;
  const data = await response.json();
  const orders: Order[] = data.orders ?? data ?? [];
  return orders.filter(o => o.estado !== 'finalizado' && o.estado !== 'cancelado').length;
};
