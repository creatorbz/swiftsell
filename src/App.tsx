import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { ProductGrid } from './components/ProductGrid';
import { ProductManagement } from './components/ProductManagement';
import { SalesManagement } from './components/SalesManagement';
import { EmployeeManagement } from './components/EmployeeManagement';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Receipt } from './components/Receipt';
import { SalesJournal } from './components/SalesJournal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingScreen } from './components/LoadingScreen';
import { Toaster } from 'react-hot-toast';
import { Transaction } from './types';
import './index.css';

const DEMO_PRODUCTS = [
  { id: '1', name: 'Kopi', price: 15000, wholesalePrice: 12000, minWholesaleQty: 10, category: 'Minuman', stock: 100 },
  { id: '2', name: 'Teh', price: 8000, wholesalePrice: 6000, minWholesaleQty: 15, category: 'Minuman', stock: 150 },
  { id: '3', name: 'Roti Bakar', price: 12000, wholesalePrice: 10000, minWholesaleQty: 8, category: 'Makanan', stock: 50 },
  { id: '4', name: 'Kue', price: 5000, wholesalePrice: 4000, minWholesaleQty: 20, category: 'Cemilan', stock: 75 },
  { id: '5', name: 'Salad', price: 20000, wholesalePrice: 17000, minWholesaleQty: 5, category: 'Makanan', stock: 30 },
  { id: '6', name: 'Jus', price: 10000, wholesalePrice: 8000, minWholesaleQty: 12, category: 'Minuman', stock: 80 },
];

function App() {
  const [currentReceipt, setCurrentReceipt] = useState<Transaction | null>(null);
  const [showSalesJournal, setShowSalesJournal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      // Initialize products if not exist
      const savedProducts = localStorage.getItem('pos-products');
      if (!savedProducts) {
        localStorage.setItem('pos-products', JSON.stringify(DEMO_PRODUCTS));
      }

      // Initialize transactions if not exist
      const savedTransactions = localStorage.getItem('pos-transactions');
      if (!savedTransactions) {
        localStorage.setItem('pos-transactions', JSON.stringify([]));
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Initialization error:', error);
      // Still set initialized to true to prevent infinite loading
      setIsInitialized(true);
    }
  }, []);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute allowedRoles={['owner', 'store_manager', 'shopkeeper']}>
                <Layout onShowSales={() => setShowSalesJournal(true)}>
                  <ProductGrid />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/products" element={
              <ProtectedRoute allowedRoles={['owner', 'store_manager']}>
                <Layout onShowSales={() => setShowSalesJournal(true)}>
                  <ProductManagement />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/sales" element={
              <ProtectedRoute allowedRoles={['owner', 'store_manager']}>
                <Layout onShowSales={() => setShowSalesJournal(true)}>
                  <SalesManagement setCurrentReceipt={setCurrentReceipt} />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/employees" element={
              <ProtectedRoute allowedRoles={['owner']}>
                <Layout onShowSales={() => setShowSalesJournal(true)}>
                  <EmployeeManagement />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {currentReceipt && (
            <Receipt
              transaction={currentReceipt}
              onClose={() => setCurrentReceipt(null)}
            />
          )}

          {showSalesJournal && (
            <ProtectedRoute allowedRoles={['owner', 'store_manager']}>
              <SalesJournal
                onClose={() => setShowSalesJournal(false)}
              />
            </ProtectedRoute>
          )}

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 2000,
              style: {
                background: '#fff',
                color: '#363636',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                borderRadius: '0.5rem',
                padding: '1rem',
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
