import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { CartItem, Product, Transaction } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, change: number, isWholesale?: boolean) => void;
  clearCart: () => void;
  checkout: () => Transaction;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('pos-cart');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading cart:', error);
      return [];
    }
  });

  // Clear cart on user change
  useEffect(() => {
    setItems([]);
  }, [currentUser?.id]);

  useEffect(() => {
    try {
      if (items.length > 0) {
        localStorage.setItem('pos-cart', JSON.stringify(items));
      } else {
        localStorage.removeItem('pos-cart');
      }
    } catch (error) {
      console.error('Error saving cart:', error);
      toast.error('Gagal menyimpan keranjang');
    }
  }, [items]);

  const addToCart = (product: Product) => {
    if (!product) {
      console.error('Invalid product:', product);
      return;
    }

    if (product.stock <= 0) {
      toast.error('Stok produk habis');
      return;
    }

    setItems(current => {
      const existingItem = current.find(item => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          toast.error(`Stok tidak mencukupi. Maksimal ${product.stock} unit`);
          return current;
        }

        const newQuantity = existingItem.quantity + 1;
        const isWholesale = product.minWholesaleQty ? newQuantity >= product.minWholesaleQty : false;
        
        return current.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity, isWholesale }
            : item
        );
      }

      return [...current, { 
        product, 
        quantity: 1, 
        isWholesale: product.minWholesaleQty ? 1 >= product.minWholesaleQty : false
      }];
    });
  };

  const updateQuantity = (productId: string, change: number, isWholesale?: boolean) => {
    if (!productId) return;

    setItems(current => {
      const updatedItems = current
        .map(item => {
          if (item.product.id === productId) {
            const newQuantity = Math.max(0, item.quantity + change);
            
            if (newQuantity > item.product.stock) {
              toast.error(`Stok tidak mencukupi. Maksimal ${item.product.stock} unit`);
              return item;
            }

            if (newQuantity === 0) {
              return null;
            }

            return {
              ...item,
              quantity: newQuantity,
              isWholesale: isWholesale ?? (item.product.minWholesaleQty ? newQuantity >= item.product.minWholesaleQty : false)
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);

      return updatedItems;
    });
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('pos-cart');
    toast.success('Keranjang dikosongkan');
  };

  const checkout = () => {
    if (!currentUser) {
      throw new Error('User tidak terautentikasi');
    }

    try {
      // Validate stock availability
      const products = JSON.parse(localStorage.getItem('pos-products') || '[]');
      for (const item of items) {
        const product = products.find((p: Product) => p.id === item.product.id);
        if (!product) {
          throw new Error(`Produk "${item.product.name}" tidak ditemukan`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Stok "${item.product.name}" tidak mencukupi`);
        }
      }

      const total = items.reduce((sum, item) => {
        const price = item.isWholesale && item.product.wholesalePrice 
          ? item.product.wholesalePrice 
          : item.product.price;
        return sum + price * item.quantity;
      }, 0);

      const transaction: Transaction = {
        id: `TRX${Date.now()}`,
        items: [...items],
        total,
        timestamp: Date.now(),
        cashier: currentUser,
      };

      // Update transactions
      const savedTransactions: Transaction[] = JSON.parse(localStorage.getItem('pos-transactions') || '[]');
      localStorage.setItem(
        'pos-transactions',
        JSON.stringify([...savedTransactions, transaction])
      );

      // Update product stock
      const updatedProducts = products.map((product: Product) => {
        const cartItem = items.find(item => item.product.id === product.id);
        if (cartItem) {
          return {
            ...product,
            stock: product.stock - cartItem.quantity
          };
        }
        return product;
      });
      localStorage.setItem('pos-products', JSON.stringify(updatedProducts));

      clearCart();
      return transaction;
    } catch (error) {
      console.error('Error during checkout:', error);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        clearCart,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
