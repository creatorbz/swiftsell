import { useState, useEffect } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Package, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addToCart } = useCart();

  useEffect(() => {
    const savedProducts = localStorage.getItem('pos-products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const handleQuantityChange = (productId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue < 0) return;
    
    const product = products.find(p => p.id === productId);
    if (product && numValue > product.stock) {
      toast.error(`Stok tidak mencukupi. Maksimal ${product.stock} unit`);
      return;
    }

    setQuantities(prev => ({
      ...prev,
      [productId]: numValue
    }));
  };

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id] || 1;
    if (quantity > product.stock) {
      toast.error(`Stok tidak mencukupi. Tersedia ${product.stock} unit`);
      return;
    }
    
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setQuantities(prev => ({ ...prev, [product.id]: 0 }));
  };

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="space-y-8 p-6">
      {categories.map(category => (
        <div key={category} className="space-y-4">
          <h2 className="text-xl font-semibold text-indigo-900">{category}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products
              .filter(product => product.category === category)
              .map((product) => (
                <div
                  key={product.id}
                  className="card p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex-grow">
                      <h3 className="text-lg font-medium text-gray-800">{product.name}</h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-indigo-600 font-bold">
                          Rp {product.price.toLocaleString()}
                        </p>
                        {product.wholesalePrice > 0 && product.minWholesaleQty > 0 && (
                          <p className="text-sm text-indigo-500">
                            Grosir: Rp {product.wholesalePrice.toLocaleString()}
                            <span className="text-gray-500"> (min. {product.minWholesaleQty} unit)</span>
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Package size={16} className="text-gray-400" />
                        <span className={`text-sm ${product.stock <= 10 ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
                          Stok: {product.stock || 0} unit
                        </span>
                      </div>
                    </div>

                    {product.stock > 0 ? (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(product.id, String(Math.max(0, (quantities[product.id] || 0) - 1)))}
                            className="p-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                          >
                            <Minus size={16} />
                          </button>
                          <input
                            type="number"
                            min="0"
                            max={product.stock}
                            value={quantities[product.id] || 0}
                            onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                            className="w-16 px-2 py-1 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          <button
                            onClick={() => handleQuantityChange(product.id, String((quantities[product.id] || 0) + 1))}
                            className="p-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full btn-primary justify-center py-1.5"
                          disabled={!quantities[product.id]}
                        >
                          <Plus size={18} />
                          <span>Tambah ke Keranjang</span>
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <button
                          disabled
                          className="w-full py-2 px-4 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed font-medium"
                        >
                          Stok Habis
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
