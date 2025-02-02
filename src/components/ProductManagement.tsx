import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, Package } from 'lucide-react';
import { Product } from '../types';

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const savedProducts = localStorage.getItem('pos-products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const saveProducts = (newProducts: Product[]) => {
    localStorage.setItem('pos-products', JSON.stringify(newProducts));
    setProducts(newProducts);
  };

  const handleAdd = (product: Product) => {
    const newProduct = { ...product, id: Date.now().toString() };
    saveProducts([...products, newProduct]);
    setShowAddForm(false);
  };

  const handleEdit = (product: Product) => {
    saveProducts(products.map(p => p.id === product.id ? product : p));
    setEditingProduct(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      saveProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Produk</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          Tambah Produk
        </button>
      </div>

      <div className="grid gap-4">
        {products.map(product => (
          <div key={product.id} className="card p-4">
            {editingProduct?.id === product.id ? (
              <EditForm
                product={product}
                onSave={handleEdit}
                onCancel={() => setEditingProduct(null)}
              />
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-800">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-indigo-600 font-bold">
                      Rp {product.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-indigo-600">
                      Harga Grosir: Rp {product.wholesalePrice?.toLocaleString() || '-'} 
                      {product.minWholesaleQty > 0 && ` (min. ${product.minWholesaleQty} unit)`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Package size={16} className="text-gray-400" />
                    <span className={`text-sm ${product.stock <= 10 ? 'text-red-500' : 'text-gray-600'}`}>
                      Stok: {product.stock || 0}
                    </span>
                    {product.stockNote && (
                      <span className="text-sm text-gray-500">({product.stockNote})</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Tambah Produk Baru</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <ProductForm onSubmit={handleAdd} onCancel={() => setShowAddForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

interface ProductFormProps {
  product?: Product;
  onSubmit: (product: Product) => void;
  onCancel: () => void;
}

function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price.toString() || '');
  const [wholesalePrice, setWholesalePrice] = useState(product?.wholesalePrice?.toString() || '');
  const [minWholesaleQty, setMinWholesaleQty] = useState(product?.minWholesaleQty?.toString() || '');
  const [category, setCategory] = useState(product?.category || '');
  const [stock, setStock] = useState(product?.stock?.toString() || '0');
  const [stockNote, setStockNote] = useState(product?.stockNote || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: product?.id || '',
      name,
      price: parseFloat(price),
      wholesalePrice: wholesalePrice ? parseFloat(wholesalePrice) : 0,
      minWholesaleQty: minWholesaleQty ? parseInt(minWholesaleQty) : 0,
      category,
      stock: parseInt(stock),
      stockNote: stockNote.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nama Produk
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Harga Retail (Rp)
        </label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
          min="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Harga Grosir (Rp)
        </label>
        <input
          type="number"
          value={wholesalePrice}
          onChange={(e) => setWholesalePrice(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          min="0"
          placeholder="Kosongkan jika tidak ada harga grosir"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Minimal Pembelian Grosir (Unit)
        </label>
        <input
          type="number"
          value={minWholesaleQty}
          onChange={(e) => setMinWholesaleQty(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          min="0"
          placeholder="Minimal unit untuk harga grosir"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kategori
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option value="">Pilih kategori</option>
          <option value="Makanan">Makanan</option>
          <option value="Minuman">Minuman</option>
          <option value="Cemilan">Cemilan</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stok
        </label>
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
          min="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Keterangan Stok (Opsional)
        </label>
        <input
          type="text"
          value={stockNote}
          onChange={(e) => setStockNote(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          placeholder="Contoh: Tersedia di gudang"
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button type="submit" className="flex-1 btn-primary justify-center">
          {product ? 'Simpan' : 'Tambah'} Produk
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 btn-secondary justify-center"
        >
          Batal
        </button>
      </div>
    </form>
  );
}

interface EditFormProps {
  product: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

function EditForm({ product, onSave, onCancel }: EditFormProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <ProductForm
        product={product}
        onSubmit={onSave}
        onCancel={onCancel}
      />
    </div>
  );
}
