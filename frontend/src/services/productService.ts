export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio_profesional: string;
  stock: number;
  categoria_id: number;
  imagen_url?: string;
  oculto?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  // Si la url es relativa (ej: /uploads/foto.jpg), le añadimos el dominio del backend
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${url}`;
};

export const getProducts = async (token?: string, page = 1, categoria_id?: number, search?: string, sort?: string) => {
  const url = new URL(`${API_URL}/products`);
  url.searchParams.append('page', page.toString());
  if (categoria_id) url.searchParams.append('categoria_id', categoria_id.toString());
  if (search)       url.searchParams.append('search', search);
  if (sort)         url.searchParams.append('sort', sort);

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url.toString(), { headers });
  
  if (!response.ok) throw new Error('Failed to fetch products');
  
  return response.json();
};

export const createProduct = async (token: string, productData: FormData) => {
  const response = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: productData
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al crear producto');
  }
  return response.json();
};

export const updateProduct = async (token: string, id: number, productData: FormData) => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: productData
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al actualizar producto');
  }
  return response.json();
};

export const deleteProduct = async (token: string, id: number) => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al eliminar producto');
  }
  return response.json();
};
