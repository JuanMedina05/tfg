import { useState, useEffect } from 'react';
import { User as UserIcon, Package, Clock, CheckCircle, XCircle, Settings, Users, ClipboardList, Pencil, Save, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getOrders, type Order } from '../services/orderService';
import { updateCurrentUser } from '../services/userService';
import AdminProductManager from '../components/AdminProductManager';
import AdminUserManager from '../components/AdminUserManager';
import AdminOrderManager from '../components/AdminOrderManager';

const Profile = () => {
  const { user, token, logoutState } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'datos' | 'pedidos' | 'productos' | 'usuarios' | 'allpedidos'>(
    (location.state as { tab?: string } | null)?.tab === 'allpedidos' ? 'allpedidos' : 'datos'
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [errorOrders, setErrorOrders] = useState<string | null>(null);

  // Estado edición de datos personales
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ nombre: '', apodo: '', telefono: '', num_colegiado: '', password: '', confirmPassword: '' });
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  // Escuchar el evento del Navbar cuando se pulsa el enlace de Pedidos
  useEffect(() => {
    const handler = () => setActiveTab('allpedidos');
    window.addEventListener('nav-admin-pedidos', handler);
    return () => window.removeEventListener('nav-admin-pedidos', handler);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      setErrorOrders(null);
      try {
        const data = await getOrders(token!);
        setOrders(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setErrorOrders(err.message);
        } else {
          setErrorOrders('Error al cargar el historial de pedidos');
        }
      } finally {
        setLoadingOrders(false);
      }
    };

    if (activeTab === 'pedidos' && token) {
      fetchOrders();
    }
  }, [activeTab, token]);

  const handleLogout = () => {
    logoutState();
    navigate('/login');
  };

  if (!user) return null;

  const isAdmin = user.rol_id === 1;

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'text-orange-600 bg-orange-50';
      case 'en proceso': return 'text-blue-600 bg-blue-50';
      case 'finalizado': return 'text-green-600 bg-green-50';
      case 'cancelado': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente': return <Clock size={16} />;
      case 'cancelado': return <XCircle size={16} />;
      default: return <CheckCircle size={16} />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10">
      {/* Header del Perfil */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="bg-brand-50 w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0">
            <UserIcon className="text-brand-500" size={40} />
          </div>
          <div className="text-center sm:text-left flex-grow">
            <h1 className="text-3xl font-bold text-slate-900">
              {user.nombre}{user.apodo ? ` "${user.apodo}"` : ''}
            </h1>
            <p className="text-slate-500 text-lg">{user.num_colegiado}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div className="flex border-b border-slate-200 mb-6 gap-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('datos')}
          className={`pb-4 font-medium text-lg transition-colors relative whitespace-nowrap ${activeTab === 'datos' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          Mis Datos
          {activeTab === 'datos' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('pedidos')}
          className={`pb-4 font-medium text-lg transition-colors relative whitespace-nowrap ${activeTab === 'pedidos' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          Mis Pedidos
          {activeTab === 'pedidos' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-t-full"></div>
          )}
        </button>
        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab('productos')}
              className={`pb-4 font-medium text-lg transition-colors relative whitespace-nowrap flex items-center gap-2 ${activeTab === 'productos' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <Settings size={18} />
              Gestión de Productos
              {activeTab === 'productos' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('usuarios')}
              className={`pb-4 font-medium text-lg transition-colors relative whitespace-nowrap flex items-center gap-2 ${activeTab === 'usuarios' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <Users size={18} />
              Gestión de Usuarios
              {activeTab === 'usuarios' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('allpedidos')}
              className={`pb-4 font-medium text-lg transition-colors relative whitespace-nowrap flex items-center gap-2 ${activeTab === 'allpedidos' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <ClipboardList size={18} />
              Gestión de Pedidos
              {activeTab === 'allpedidos' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-t-full"></div>
              )}
            </button>
          </>
        )}
      </div>

      {/* Contenido Pestaña: Mis Datos */}
      {activeTab === 'datos' && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Información Personal</h2>
            {!isEditing && (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setEditError(null);
                  setEditSuccess(false);
                  setEditForm({ nombre: user.nombre, apodo: user.apodo || '', telefono: user.telefono || '', num_colegiado: user.num_colegiado, password: '', confirmPassword: '' });
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-lg font-medium transition-colors"
              >
                <Pencil size={16} />
                Editar datos
              </button>
            )}
          </div>

          {editError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{editError}</div>
          )}
          {editSuccess && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium">¡Datos actualizados correctamente!</div>
          )}

          {isEditing ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setEditError(null);
                if (editForm.password && editForm.password !== editForm.confirmPassword) {
                  setEditError('Las contraseñas no coinciden');
                  return;
                }
                try {
                  const payload: Record<string, string> = {};
                  if (editForm.nombre) payload.nombre = editForm.nombre;
                  if (editForm.apodo !== undefined) payload.apodo = editForm.apodo;
                  if (editForm.telefono !== undefined) payload.telefono = editForm.telefono;
                  if (editForm.num_colegiado) payload.num_colegiado = editForm.num_colegiado;
                  if (editForm.password) payload.password = editForm.password;
                  const result = await updateCurrentUser(token!, user.id, payload);
                  // Actualizar el localStorage con los nuevos datos
                  const stored = JSON.parse(localStorage.getItem('user') || '{}');
                  localStorage.setItem('user', JSON.stringify({ ...stored, ...result.user }));
                  setIsEditing(false);
                  setEditSuccess(true);
                  // Forzar recarga para reflejar cambios en header
                  window.location.reload();
                } catch (err: unknown) {
                  if (err instanceof Error) setEditError(err.message);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                  <input required type="text" value={editForm.nombre} onChange={e => setEditForm(p => ({ ...p, nombre: e.target.value }))} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Apodo</label>
                  <input type="text" value={editForm.apodo} onChange={e => setEditForm(p => ({ ...p, apodo: e.target.value }))} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                  <input type="tel" value={editForm.telefono} onChange={e => setEditForm(p => ({ ...p, telefono: e.target.value }))} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nº de Colegiado</label>
                  <input required type="text" value={editForm.num_colegiado} onChange={e => setEditForm(p => ({ ...p, num_colegiado: e.target.value }))} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Contraseña <span className="text-slate-400 font-normal">(dejar en blanco para no cambiar)</span></label>
                  <input type="password" value={editForm.password} onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Contraseña</label>
                  <input type="password" value={editForm.confirmPassword} onChange={e => setEditForm(p => ({ ...p, confirmPassword: e.target.value }))} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-200 mt-4">
                <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 font-medium transition-colors">
                  <Save size={16} />
                  Guardar cambios
                </button>
                <button type="button" onClick={() => { setIsEditing(false); setEditError(null); }} className="flex items-center gap-2 px-6 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors">
                  <X size={16} />
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <span className="block text-sm text-slate-500 mb-1 font-medium">Nombre</span>
                <span className="text-lg font-medium text-slate-900">{user.nombre}</span>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <span className="block text-sm text-slate-500 mb-1 font-medium">Apodo</span>
                <span className="text-lg font-medium text-slate-900">{user.apodo || '-'}</span>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <span className="block text-sm text-slate-500 mb-1 font-medium">Teléfono</span>
                <span className="text-lg font-medium text-slate-900">{user.telefono || '-'}</span>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <span className="block text-sm text-slate-500 mb-1 font-medium">Nº de Colegiado</span>
                <span className="text-lg font-medium text-slate-900">{user.num_colegiado}</span>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <span className="block text-sm text-slate-500 mb-1 font-medium">Rol</span>
                <span className="text-lg font-medium text-brand-600 capitalize">
                  {user.rol_id === 1 ? 'Administrador' : 'Veterinario'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contenido Pestaña: Mis Pedidos */}
      {activeTab === 'pedidos' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="flex justify-center p-12 bg-white rounded-2xl shadow-sm border border-slate-200">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          ) : errorOrders ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">
              {errorOrders}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="text-slate-400" size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">No tienes ningún pedido</h2>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Aún no has realizado ninguna compra en nuestra tienda.
              </p>
              <Link
                to="/"
                className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Explorar Catálogo
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="py-4 px-6 text-sm font-semibold text-slate-500">Nº Pedido</th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-500">Fecha</th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-500">Artículos</th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-500 text-right">Total</th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-500 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => {
                      const totalItems = order.items.reduce((sum, item) => sum + item.cantidad, 0);
                      const fecha = new Date(order.fecha).toLocaleDateString('es-ES', {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      });

                      return (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-6 font-medium text-slate-900">#{order.id.toString().padStart(4, '0')}</td>
                          <td className="py-4 px-6 text-slate-600">{fecha}</td>
                          <td className="py-4 px-6 text-slate-600">{totalItems} uds.</td>
                          <td className="py-4 px-6 font-bold text-slate-900 text-right">{Number(order.total).toFixed(2)}€</td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium capitalize mx-auto justify-center ${getStatusColor(order.estado)}`}>
                              {getStatusIcon(order.estado)}
                              {order.estado}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contenido Pestaña: Gestión de Productos */}
      {isAdmin && activeTab === 'productos' && (
        <AdminProductManager />
      )}

      {/* Contenido Pestaña: Gestión de Usuarios */}
      {isAdmin && activeTab === 'usuarios' && (
        <AdminUserManager />
      )}

      {/* Contenido Pestaña: Gestión de Pedidos (todos) */}
      {isAdmin && activeTab === 'allpedidos' && (
        <AdminOrderManager />
      )}
    </div>
  );
};

export default Profile;
