import { useState, useEffect, useCallback } from 'react';
import { Search, Store, SlidersHorizontal, X } from 'lucide-react';
import { getProducts, type Product } from '../services/productService';
import { useAuth } from '../hooks/useAuth';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { id: undefined, label: 'Todas' },
  { id: 1,         label: 'Alimentación' },
  { id: 2,         label: 'Medicamentos' },
  { id: 3,         label: 'Accesorios' },
];

const SORT_OPTIONS = [
  { value: '',           label: 'Por defecto' },
  { value: 'nombre_asc', label: 'A → Z' },
  { value: 'nombre_desc',label: 'Z → A' },
  { value: 'precio_asc', label: 'Precio: menor primero' },
  { value: 'precio_desc',label: 'Precio: mayor primero' },
];

const Catalog = () => {
  const [products, setProducts]       = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [search, setSearch]           = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId]   = useState<number | undefined>(undefined);
  const [sort, setSort]               = useState('');

  const { token } = useAuth();

  // Debounce del buscador (300 ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts(token, 1, categoryId, debouncedSearch || undefined, sort || undefined);
      setProducts(data.products || []);
    } catch {
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  }, [token, categoryId, debouncedSearch, sort]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, [fetchProducts]);

  const hasActiveFilters = !!debouncedSearch || categoryId !== undefined || !!sort;

  const clearFilters = () => {
    setSearch('');
    setCategoryId(undefined);
    setSort('');
  };

  return (
    <div>
      {/* Cabecera */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-1">
          <Store className="text-brand-500" />
          Catálogo de Productos
        </h1>
        <p className="text-slate-500">Explora nuestra selección de productos veterinarios de alta calidad.</p>
      </div>

      {/* Barra de filtros */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col md:flex-row gap-3">

          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow text-sm"
            />
          </div>

          {/* Categoría */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-slate-400 shrink-0" />
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.label}
                  onClick={() => setCategoryId(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    categoryId === cat.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ordenar */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-700 bg-white"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Limpiar filtros */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
            >
              <X size={15} />
              Limpiar
            </button>
          )}
        </div>

        {/* Info de resultados */}
        {!loading && (
          <p className="text-xs text-slate-400 mt-2 ml-1">
            {products.length === 0
              ? 'Sin resultados'
              : `${products.length} producto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}`}
            {debouncedSearch && ` para "${debouncedSearch}"`}
          </p>
        )}
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">{error}</div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center">
          <div className="bg-brand-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-brand-500" size={24} />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">Sin resultados</h3>
          <p className="text-slate-500 mb-4">No se encontraron productos con los filtros aplicados.</p>
          <button onClick={clearFilters} className="text-brand-600 hover:underline text-sm font-medium">
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalog;