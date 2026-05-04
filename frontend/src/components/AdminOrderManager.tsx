import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { getOrders, updateOrderStatus, type Order } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';

const STATUS_OPTIONS = ['pendiente', 'en proceso', 'finalizado', 'cancelado'] as const;
type Status = typeof STATUS_OPTIONS[number];

const STATUS_STYLES: Record<Status, string> = {
  pendiente:     'bg-orange-100 text-orange-700',
  'en proceso':  'bg-blue-100 text-blue-700',
  finalizado:    'bg-green-100 text-green-700',
  cancelado:     'bg-red-100 text-red-700',
};

const AdminOrderManager = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('pendiente');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders(token!);
      setOrders(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (token) fetchOrders();
  }, [token, fetchOrders]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    if (!token) return;
    setUpdatingId(orderId);
    setError(null);
    try {
      await updateOrderStatus(token, orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, estado: newStatus } : o));
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filterStatus === 'historial'
    ? orders.filter(o => o.estado === 'finalizado' || o.estado === 'cancelado')
    : orders.filter(o => o.estado === filterStatus);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {['pendiente', 'en proceso', 'historial'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              filterStatus === s
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
            }`}
          >
            {s === 'historial' 
              ? `Historial (${orders.filter(o => o.estado === 'finalizado' || o.estado === 'cancelado').length})` 
              : `${s} (${orders.filter(o => o.estado === s).length})`}
          </button>
        ))}
      </div>

      {/* Tabla de pedidos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No hay pedidos en este estado.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(order => {
              const isExpanded = expandedId === order.id;
              const fecha = new Date(order.fecha).toLocaleDateString('es-ES', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
              });

              return (
                <div key={order.id}>
                  {/* Fila principal */}
                  <div
                    className="flex flex-wrap items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    <span className="font-mono font-semibold text-slate-900 w-16">
                      #{order.id.toString().padStart(4, '0')}
                    </span>
                    <span className="text-slate-500 text-sm flex-1 min-w-[120px]">{fecha}</span>
                    <span className="text-slate-500 text-sm">Usuario #{order.usuario_id}</span>
                    <span className="font-bold text-slate-900 w-24 text-right">{Number(order.total).toFixed(2)}€</span>

                    {/* Selector de estado */}
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <select
                        value={order.estado}
                        disabled={updatingId === order.id}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs font-semibold rounded-full px-3 py-1 border-0 cursor-pointer focus:ring-2 focus:ring-brand-400 capitalize ${STATUS_STYLES[order.estado as Status] ?? 'bg-slate-100 text-slate-700'}`}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {updatingId === order.id && (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-brand-500"></div>
                      )}
                    </div>

                    <button className="text-slate-400 hover:text-slate-600 ml-2">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>

                  {/* Detalle expandido: líneas del pedido */}
                  {isExpanded && (
                    <div className="bg-slate-50 px-8 py-4 border-t border-slate-100">
                      {order.items.length === 0 ? (
                        <p className="text-slate-500 text-sm">Sin artículos</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-slate-400 text-left">
                              <th className="pb-2 font-medium">Producto ID</th>
                              <th className="pb-2 font-medium text-center">Cantidad</th>
                              <th className="pb-2 font-medium text-right">Precio unit.</th>
                              <th className="pb-2 font-medium text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {order.items.map(item => (
                              <tr key={item.id} className="text-slate-700">
                                <td className="py-2 flex items-center gap-2">
                                  <Package size={14} className="text-slate-400" />
                                  #{item.producto_id}
                                </td>
                                <td className="py-2 text-center">{item.cantidad}</td>
                                <td className="py-2 text-right">{Number(item.precio_unitario_aplicado).toFixed(2)}€</td>
                                <td className="py-2 text-right font-medium">
                                  {(Number(item.precio_unitario_aplicado) * item.cantidad).toFixed(2)}€
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t border-slate-300 font-bold text-slate-900">
                              <td colSpan={3} className="pt-3 text-right">Total:</td>
                              <td className="pt-3 text-right">{Number(order.total).toFixed(2)}€</td>
                            </tr>
                          </tfoot>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrderManager;
