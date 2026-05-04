const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const login = async (num_colegiado: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ num_colegiado, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al iniciar sesión');
  }

  return data;
};
