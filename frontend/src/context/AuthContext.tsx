import { createContext, useState, type ReactNode } from 'react';

interface User {
  id: number;
  nombre: string;
  apodo?: string;
  telefono?: string;
  num_colegiado: string;
  rol_id: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loginState: (userData: User, token: string) => void;
  logoutState: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const loginState = (userData: User, newToken: string) => {
    setUser(userData);
    setToken(newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', newToken);
  };

  const logoutState = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loginState,
        logoutState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
