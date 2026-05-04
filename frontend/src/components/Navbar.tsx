import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { ShoppingCart, User, Info, Store, Dog, ClipboardList } from 'lucide-react'
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { getActiveOrderCount } from '../services/orderService';

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, token } = useAuth();
  const isAdmin = user?.rol_id === 1;

  const [activeOrderCount, setActiveOrderCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      if (isAdmin && token) {
        try {
          const count = await getActiveOrderCount(token);
          setActiveOrderCount(count);
        } catch (error) {
          console.error("Error fetching order count", error);
        }
      }
    };

    fetchCount();
    
    // Refresh the count periodically and on window focus
    const interval = setInterval(fetchCount, 30000); // Every 30 seconds
    window.addEventListener('focus', fetchCount);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', fetchCount);
    };
  }, [isAdmin, token]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive
      ? 'bg-brand-100 text-brand-700 font-medium'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="bg-brand-500 text-white p-2 rounded-xl group-hover:bg-brand-600 transition-colors">
              <Dog size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              Ap<span className="text-brand-600">Vet</span>
            </span>
          </NavLink>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/" className={navLinkClass}>
              <Store size={18} />
              <span>Catálogo</span>
            </NavLink>
            <NavLink to="/sobre-nosotros" className={navLinkClass}>
              <Info size={18} />
              <span>Sobre nosotros</span>
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/mi-perfil"
                state={{ tab: 'allpedidos' }}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative ${isActive
                    ? 'bg-brand-100 text-brand-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
                onClick={() => {
                  // Dispatch a custom event so Profile can switch tab
                  window.dispatchEvent(new CustomEvent('nav-admin-pedidos'));
                }}
              >
                <ClipboardList size={18} />
                <span>Pedidos</span>
                {activeOrderCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {activeOrderCount}
                  </span>
                )}
              </NavLink>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <NavLink to="/mi-perfil" className={navLinkClass}>
              <User size={18} />
              <span className="hidden sm:inline">Mi Perfil</span>
            </NavLink>
            <NavLink to="/carrito" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm relative">
              <ShoppingCart size={18} />
              <span className="hidden sm:inline">Carrito</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
