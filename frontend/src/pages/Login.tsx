import { useState } from 'react';
import { User, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { login } from '../services/authService';

const Login = () => {
  const [numColegiado, setNumColegiado] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { loginState } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(numColegiado, password);
      loginState(data.user, data.access_token);
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center max-w-md mx-auto mt-10">
      <div className="bg-brand-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <User className="text-brand-500" size={32} />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Iniciar Sesión</h1>
      <p className="text-slate-500 mb-6">
        Accede con tu número de colegiado y contraseña.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-left">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-left">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nº de Colegiado
          </label>
          <input
            type="text"
            value={numColegiado}
            onChange={(e) => setNumColegiado(e.target.value)}
            placeholder="Ej: 12345 o ADMIN001"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
            required
          />
        </div>
        <div className="text-left">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 text-white font-medium py-2 px-4 rounded-lg transition-colors mt-2"
        >
          {loading ? 'Cargando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}

export default Login