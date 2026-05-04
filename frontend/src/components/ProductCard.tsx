import { ShoppingCart } from 'lucide-react';
import { type Product, getImageUrl } from '../services/productService';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const isAdmin = user?.rol_id === 1;

  const displayPrice = Number(product.precio_profesional);

  const handleAddToCart = () => {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="h-48 overflow-hidden bg-slate-100">
        {product.imagen_url ? (
          <img
            src={getImageUrl(product.imagen_url)}
            alt={product.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            Sin imagen
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg text-slate-900 line-clamp-2 mb-1">
          {product.nombre}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">
          {product.descripcion}
        </p>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-2xl font-bold text-brand-600">
                {displayPrice.toFixed(2)}€
              </span>
              {isAdmin && (
                <span className="block text-xs text-slate-400">Precio profesional</span>
              )}
            </div>
            {product.stock <= 0 && (
              <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-full">
                Sin stock
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-colors disabled:cursor-not-allowed ${
              added
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white disabled:bg-slate-300'
            }`}
            disabled={product.stock <= 0}
          >
            <ShoppingCart size={18} />
            <span>{added ? 'Añadido' : 'Añadir al carrito'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
