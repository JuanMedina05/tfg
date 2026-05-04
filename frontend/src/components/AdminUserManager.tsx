import { useState, useEffect, useCallback } from 'react';
import { Trash2, Plus, AlertCircle, Eye, Package } from 'lucide-react';
import { getUsers, deleteUser, createUser, getUserOrders, type User } from '../services/userService';
import { type Order } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';

const AdminUserManager = () => {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedUserOrders, setSelectedUserOrders] = useState<{ user: User, orders: Order[] } | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const emptyUser = {
    nombre: '',
    apodo: '',
    telefono: '',
    num_colegiado: '',
    password: '',
    rol_id: 2
  };

  const [formData, setFormData] = useState(emptyUser);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers(token!);
      setUsers(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (token) fetchUsers();
  }, [token, fetchUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? Number(value) : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    try {
      await createUser(token, formData);
      setIsAdding(false);
      setFormData(emptyUser);
      fetchUsers();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (currentUser?.id === id) {
      alert('No puedes eliminar tu propia cuenta.');
      return;
    }
    if (!window.confirm('¿Estás seguro de que deseas borrar este usuario? Esta acción no se puede deshacer.')) return;
    
    setError(null);
    try {
      await deleteUser(token, id);
      fetchUsers();
      if (selectedUserOrders?.user.id === id) {
        setSelectedUserOrders(null);
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    }
  };

  const handleViewOrders = async (user: User) => {
    if (!token) return;
    setLoadingOrders(true);
    setError(null);
    try {
      const orders = await getUserOrders(token, user.id);
      setSelectedUserOrders({ user, orders });
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  const startAdd = () => {
    setIsAdding(true);
    setFormData(emptyUser);
    setSelectedUserOrders(null);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setFormData(emptyUser);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <span>{error}</span>
        </div>
      )}

      {isAdding && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Añadir Nuevo Usuario</h3>
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input required type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Apodo</label>
                <input type="text" name="apodo" value={formData.apodo} onChange={handleInputChange} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                <input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nº de Colegiado</label>
                <input required type="text" name="num_colegiado" value={formData.num_colegiado} onChange={handleInputChange} autoComplete="off" className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                <input required type="password" name="password" value={formData.password} onChange={handleInputChange} autoComplete="new-password" className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500" minLength={6} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                <select name="rol_id" value={formData.rol_id} onChange={handleInputChange} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500">
                  <option value={2}>Veterinario</option>
                  <option value={1}>Administrador</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-slate-200 mt-6">
              <button type="submit" className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 font-medium transition-colors">
                Crear Usuario
              </button>
              <button type="button" onClick={cancelForm} className="px-6 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {!isAdding && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900">Listado de Usuarios</h2>
            <button 
              onClick={startAdd}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus size={18} />
              <span>Añadir Usuario</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            {loading ? (
              <div className="p-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="py-4 px-6 text-sm font-semibold text-slate-500">ID</th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-500">Nombre / Apodo</th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-500">Nº Colegiado</th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-500">Teléfono</th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-500">Rol</th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-500 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 text-slate-500">{user.id}</td>
                        <td className="py-4 px-6 font-medium text-slate-900">
                          {user.nombre}
                          {user.apodo && <span className="ml-2 text-sm text-slate-400">({user.apodo})</span>}
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-mono">{user.num_colegiado}</td>
                        <td className="py-4 px-6 text-slate-600">{user.telefono || '-'}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.rol_id === 1 ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                            {user.rol_id === 1 ? 'Admin' : 'Veterinario'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleViewOrders(user)}
                              className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                              title="Ver Pedidos"
                            >
                              <Eye size={18} />
                            </button>
                            {currentUser?.id !== user.id && (
                              <button 
                                onClick={() => handleDelete(user.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Borrar Usuario"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">No hay usuarios registrados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal / Sección de Pedidos del Usuario */}
          {selectedUserOrders && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-6">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Package className="text-brand-500" />
                  Pedidos de {selectedUserOrders.user.nombre}
                </h3>
                <button 
                  onClick={() => setSelectedUserOrders(null)}
                  className="text-slate-400 hover:text-slate-600 font-medium text-sm"
                >
                  Cerrar
                </button>
              </div>

              {loadingOrders ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
                </div>
              ) : selectedUserOrders.orders.length === 0 ? (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl">
                  Este usuario no ha realizado ningún pedido.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="py-3 px-4 text-sm font-semibold text-slate-500">Nº Pedido</th>
                        <th className="py-3 px-4 text-sm font-semibold text-slate-500">Fecha</th>
                        <th className="py-3 px-4 text-sm font-semibold text-slate-500">Total</th>
                        <th className="py-3 px-4 text-sm font-semibold text-slate-500 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedUserOrders.orders.map((order) => {
                        const fecha = new Date(order.fecha).toLocaleDateString('es-ES', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        });
                        return (
                          <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-medium text-slate-900">#{order.id.toString().padStart(4, '0')}</td>
                            <td className="py-3 px-4 text-slate-600">{fecha}</td>
                            <td className="py-3 px-4 font-bold text-slate-900">{Number(order.total).toFixed(2)}€</td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                                {order.estado}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminUserManager;
