import { useState } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { createOrder } from '../services/orderService';
import { getImageUrl } from '../services/productService';

const Cart = () => {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);


  const handleCheckout = async () => {
    if (!token) {
      setError('Debes iniciar sesión para realizar un pedido');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        items: cartItems.map(item => ({
          producto_id: item.id,
          cantidad: item.quantity
        }))
      };
      
      await createOrder(token, payload);
      clearCart();
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al procesar el pedido');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-16 bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-500" size={40} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">¡Pedido completado!</h2>
        <p className="text-slate-500 mb-8 text-lg">
          Tu pedido se ha procesado correctamente. En breve recibirás un email con los detalles.
        </p>
        <Link 
          to="/" 
          className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 px-8 rounded-xl transition-colors"
        >
          Volver a la tienda
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-16 bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="text-slate-400" size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Tu carrito está vacío</h2>
        <p className="text-slate-500 mb-8">
          Parece que aún no has añadido ningún producto a tu carrito.
        </p>
        <Link 
          to="/" 
          className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 px-8 rounded-xl transition-colors"
        >
          Explorar el catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Tu Carrito</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {cartItems.map((item) => {
            const price = Number(item.precio_profesional);
            
            return (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.imagen_url ? (
                    <img src={getImageUrl(item.imagen_url)} alt={item.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Sin foto</div>
                  )}
                </div>
                
                <div className="flex-grow text-center sm:text-left">
                  <h3 className="font-semibold text-lg text-slate-900">{item.nombre}</h3>
                  <p className="text-brand-600 font-bold text-lg mt-1">{price.toFixed(2)}€</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-slate-100 rounded-lg p-1">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded bg-white shadow-sm hover:bg-slate-50 text-slate-600"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded bg-white shadow-sm hover:bg-slate-50 text-slate-600 disabled:opacity-50"
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="Eliminar producto"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Resumen del pedido</h2>
            
            <div className="space-y-3 text-slate-600 mb-6 border-b border-slate-100 pb-6">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>{cartTotal.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span>Gastos de envío</span>
                <span className="text-green-600 font-medium">Gratis</span>
              </div>
            </div>
            
            <div className="flex justify-between items-end mb-8">
              <span className="text-lg font-medium text-slate-900">Total</span>
              <span className="text-3xl font-bold text-brand-600">{cartTotal.toFixed(2)}€</span>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>Realizar Pedido</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;