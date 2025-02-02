import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Minus, Plus, ShoppingCart, X, Package, AlertTriangle } from 'lucide-react';
import { Receipt } from './Receipt';
import { Transaction, CartItem } from '../types';
import toast from 'react-hot-toast';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Cart({ isOpen, onClose }: CartProps) {
  const { items, updateQuantity, checkout, clearCart } = useCart();
  const [currentReceipt, setCurrentReceipt] = useState<Transaction | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    // Initialize quantities from cart items
    const newQuantities: Record<string, number> = {};
    items.forEach(item => {
      newQuantities[item.product.id] = item.quantity;
    });
    setQuantities(newQuantities);
  }, [items]);

  // Calculate total considering wholesale prices
  const total = items.reduce((sum, item) => {
    const price = item.isWholesale ? item.product.wholesalePrice : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const handleQuantityChange = (productId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue < 0) return;

    const item = items.find(i => i.product.id === productId);
    if (item && numValue > item.product.stock) {
      toast.error(`Stok tidak mencukupi. Maksimal ${item.product.stock} unit`);
      return;
    }

    setQuantities(prev => ({
      ...prev,
      [productId]: numValue
    }));

    const currentQuantity = items.find(i => i.product.id === productId)?.quantity || 0;
    const difference = numValue - currentQuantity;
    
    if (difference !== 0) {
      const isWholesale = numValue >= (item?.product.minWholesaleQty || Infinity);
      updateQuantity(productId, difference, isWholesale);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Keranjang masih kosong');
      return;
    }

    try {
      const transaction = checkout();
      setCurrentReceipt(transaction);
      toast.success('Transaksi berhasil!');
    } catch (error) {
      toast.error('Gagal melakukan checkout. Silakan coba lagi.');
      console.error('Checkout error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform transition-transform duration-300 z-50">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600">
                <ShoppingCart className="stroke-2" />
                <h2 className="text-xl font-bold">Keranjang</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center text-gray-500 mt-8 space-y-2">
                <ShoppingCart size={40} className="mx-auto text-gray-300" />
                <p>Keranjang masih kosong</p>
              </div>
            ) : (
              items.map((item) => {
                const isWholesale = item.quantity >= (item.product.minWholesaleQty || Infinity);
                const price = isWholesale ? item.product.wholesalePrice : item.product.price;
                const stockWarning = item.product.stock < 10;
                
                return (
                  <div key={item.product.id} className="card p-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-800">{item.product.name}</h3>
                          <p className="text-sm text-gray-500">{item.product.category}</p>
                        </div>
                        <button
                          onClick={() => updateQuantity(item.product.id, -item.quantity)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {stockWarning && (
                        <div className="flex items-center gap-1 text-amber-500 text-xs">
                          <AlertTriangle size={14} />
                          <span>Stok terbatas: {item.product.stock} unit</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item.product.id, String(item.quantity - 1))}
                            className="p-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                          >
                            <Minus size={16} />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={item.product.stock}
                            value={quantities[item.product.id] || 0}
                            onChange={(e) => handleQuantityChange(item.product.id, e.target.value)}
                            className="w-16 px-2 py-1 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          <button
                            onClick={() => handleQuantityChange(item.product.id, String(item.quantity + 1))}
                            className="p-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-indigo-600">
                            Rp {(price * item.quantity).toLocaleString()}
                          </p>
                          {isWholesale && (
                            <p className="text-xs text-indigo-400">Harga Grosir</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Total Pembayaran</span>
                <span className="text-xl font-bold text-indigo-600">
                  Rp {total.toLocaleString()}
                </span>
              </div>
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  title="Kosongkan Keranjang"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            <button
              onClick={handleCheckout}
              disabled={items.length === 0}
              className={`w-full btn-primary justify-center ${
                items.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Bayar Sekarang
            </button>
          </div>
        </div>
      </div>

      {currentReceipt && (
        <Receipt
          transaction={currentReceipt}
          onClose={() => {
            setCurrentReceipt(null);
            onClose();
          }}
        />
      )}
    </>
  );
}
