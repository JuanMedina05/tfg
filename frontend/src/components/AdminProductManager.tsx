import { useState, useEffect, useCallback } from 'react';
import { Edit, Trash2, Eye, EyeOff, Plus, AlertCircle } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct, type Product } from '../services/productService';
import { useAuth } from '../hooks/useAuth';

const AdminProductManager = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const emptyProduct: Partial<Product> = {
    nombre: '',
    descripcion: '',
    precio_profesional: '',
    stock: 0,
    categoria_id: 1,
    imagen_url: '',
    oculto: false
  };

  const [formData, setFormData] = useState<Partial<Product>>(emptyProduct);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts(token!);
      setProducts(data.products || []);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (token) fetchProducts();
  }, [token, fetchProducts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? Number(value) : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, value.toString());
        }
      });
      if (imageFile) {
        data.append('imagen', imageFile);
      }

      if (isEditing && isEditing.id) {
        await updateProduct(token, isEditing.id, data);
      } else {
        await createProduct(token, data);
      }
      setIsEditing(null);
      setIsAdding(false);
      setFormData(emptyProduct);
      setImageFile(null);
      fetchProducts();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    }
  };

  const handleToggleHide = async (product: Product) => {
    if (!token) return;
    try {
      const data = new FormData();
      data.append('oculto', (!product.oculto).toString());
      await updateProduct(token, product.id, data);
      fetchProducts();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!window.confirm('¿Estás seguro de que deseas borrar este producto definitivamente?')) return;
    
    setError(null);
    try {
      await deleteProduct(token, id);
      fetchProducts();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    }
  };

  const startEdit = (product: Product) => {
    setIsEditing(product);
    setIsAdding(false);
    setFormData(product);
    setImageFile(null);
  };

  const startAdd = () => {
    setIsAdding(true);
    setIsEditing(null);
    setFormData(emptyProduct);
    setImageFile(null);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setIsEditing(null);
    setFormData(emptyProduct);
    setImageFile(null);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <span>{error}</span>
        </div>
      )}

      {(isAdding || isEditing) && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-6">
            {isAdding ? 'Añadir Nuevo Producto' : 'Editar Producto'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input required type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría ID (1=Alimentación, 2=Medicamentos, 3=Accesorios)</label>
                <input required type="number" name="categoria_id" value={formData.categoria_id} onChange={handleInputChange} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea required name="descripcion" value={formData.descripcion} onChange={handleInputChange} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500" rows={3}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Precio (€)</label>
                <input required type="number" step="0.01" name="precio_profesional" value={formData.precio_profesional} onChange={handleInputChange} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                <input required type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Imagen del Producto</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
                {isEditing && isEditing.imagen_url && !imageFile && (
                  <p className="mt-1 text-xs text-slate-500">Ya hay una imagen subida. Selecciona un archivo solo si quieres cambiarla.</p>
                )}
              </div>
              <div className="md:col-span-2 flex items-center gap-2 mt-2">
                <input type="checkbox" id="oculto" name="oculto" checked={formData.oculto} onChange={handleCheckboxChange} className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                <label htmlFor="oculto" className="text-sm font-medium text-slate-700">Ocultar producto del catálogo</label>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-slate-200 mt-6">
              <button type="submit" className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 font-medium transition-colors">
                Guardar
              </button>
              <button type="button" onClick={cancelForm} className="px-6 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {!isAdding && !isEditing && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Catálogo Actual</h2>
            <button 
              onClick={startAdd}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus size={18} />
              <span>Añadir Producto</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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
                      <th className="py-4 px-6 text-sm font-semibold text-slate-500">Nombre</th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-500">Precio</th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-500">Stock</th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-500 text-center">Estado</th>
                      <th className="py-4 px-6 text-sm font-semibold text-slate-500 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map(product => (
                      <tr key={product.id} className={`hover:bg-slate-50 transition-colors ${product.oculto ? 'bg-slate-50/50' : ''}`}>
                        <td className="py-4 px-6 text-slate-500">{product.id}</td>
                        <td className="py-4 px-6 font-medium text-slate-900">
                          {product.nombre}
                          {product.oculto && <span className="ml-2 text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Oculto</span>}
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-900">{Number(product.precio_profesional).toFixed(2)}€</td>
                        <td className="py-4 px-6 text-slate-600">{product.stock}</td>
                        <td className="py-4 px-6 text-center">
                          <button 
                            onClick={() => handleToggleHide(product)}
                            className={`p-1.5 rounded-lg transition-colors ${product.oculto ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-200' : 'text-brand-600 hover:text-brand-700 hover:bg-brand-50'}`}
                            title={product.oculto ? "Mostrar en catálogo" : "Ocultar del catálogo"}
                          >
                            {product.oculto ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => startEdit(product)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(product.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Borrar"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">No hay productos en el catálogo.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminProductManager;
