export interface Product {
  id: string;
  name: string;
  price: number;
  wholesalePrice: number;
  minWholesaleQty: number;
  category: string;
  stock: number;
  stockNote?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  isWholesale?: boolean;
}

export type UserRole = 'owner' | 'store_manager' | 'shopkeeper';

export interface Employee {
  id: string;
  username: string;
  password: string; // In real app, this should be hashed
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  timestamp: number;
  cashier: Employee;
}

export interface SalesMetrics {
  totalSales: number;
  totalTransactions: number;
  averageTransactionValue: number;
  productsSold: number;
}
