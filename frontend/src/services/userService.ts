import { type Order } from './orderService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface User {
  id: number;
  nombre: string;
  apodo?: string;
  telefono?: string;
  num_colegiado: string;
  rol_id: number;
}

export const getUsers = async (token: string): Promise<User[]> => {
  const response = await fetch(`${API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al obtener usuarios');
  }
  return response.json();
};

export const deleteUser = async (token: string, id: number) => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al eliminar el usuario');
  }
  return response.json();
};

export const getUserOrders = async (token: string, id: number): Promise<Order[]> => {
  const response = await fetch(`${API_URL}/users/${id}/orders`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al obtener los pedidos del usuario');
  }
  return response.json();
};

// Se aprovecha la ruta de Auth ya que el administrador es el único que puede usarla para registrar.
export const createUser = async (token: string, userData: Partial<User> & { password?: string }) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al crear el usuario');
  }
  return response.json();
};

export const updateCurrentUser = async (token: string, id: number, data: {
  nombre?: string;
  apodo?: string;
  telefono?: string;
  num_colegiado?: string;
  password?: string;
}) => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al actualizar los datos');
  }
  return response.json();
};
