import { useState, useEffect, useMemo } from 'react';
import { BarChart, Calendar, DollarSign, TrendingUp, Package, Eye } from 'lucide-react';
import { Transaction, SalesMetrics } from '../types';

interface SalesManagementProps {
  setCurrentReceipt: (receipt: Transaction) => void;
}

export function SalesManagement({ setCurrentReceipt }: SalesManagementProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [timeFilter, setTimeFilter] = useState<'day' | 'month' | 'year'>('day');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    const savedTransactions = localStorage.getItem('pos-transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  const filteredTransactions = useMemo(() => {
    const start = new Date(selectedDate);
    let end = new Date(selectedDate);

    switch (timeFilter) {
      case 'day':
        end.setDate(start.getDate() + 1);
        break;
      case 'month':
        start.setDate(1);
        end.setMonth(start.getMonth() + 1);
        break;
      case 'year':
        start.setMonth(0, 1);
        end.setFullYear(start.getFullYear() + 1);
        break;
    }

    return transactions.filter(t => {
      const date = new Date(t.timestamp);
      return date >= start && date < end;
    });
  }, [transactions, timeFilter, selectedDate]);

  const metrics: SalesMetrics = useMemo(() => {
    const totalSales = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = filteredTransactions.length;
    const productsSold = filteredTransactions.reduce(
      (sum, t) => sum + t.items.reduce((sum, i) => sum + i.quantity, 0),
      0
    );

    return {
      totalSales,
      totalTransactions,
      averageTransactionValue: totalTransactions ? totalSales / totalTransactions : 0,
      productsSold,
    };
  }, [filteredTransactions]);

  const topProducts = useMemo(() => {
    const products = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    filteredTransactions.forEach(t => {
      t.items.forEach(item => {
        const existing = products.get(item.product.id) || {
          name: item.product.name,
          quantity: 0,
          revenue: 0,
        };
        products.set(item.product.id, {
          name: item.product.name,
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + (item.quantity * item.product.price),
        });
      });
    });

    return Array.from(products.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredTransactions]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Penjualan</h1>
        <div className="flex gap-4">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as 'day' | 'month' | 'year')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="day">Harian</option>
            <option value="month">Bulanan</option>
            <option value="year">Tahunan</option>
          </select>
          <input
            type={timeFilter === 'day' ? 'date' : timeFilter === 'month' ? 'month' : 'year'}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Penjualan</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                Rp {metrics.totalSales.toLocaleString()}
              </p>
            </div>
            <DollarSign className="text-indigo-600" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Jumlah Transaksi</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                {metrics.totalTransactions}
              </p>
            </div>
            <TrendingUp className="text-indigo-600" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Rata-rata Transaksi</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                Rp {metrics.averageTransactionValue.toLocaleString()}
              </p>
            </div>
            <BarChart className="text-indigo-600" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Produk Terjual</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                {metrics.productsSold}
              </p>
            </div>
            <Package className="text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Produk Terlaris</h2>
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-800">{product.name}</p>
                <p className="text-sm text-gray-500">Terjual: {product.quantity}</p>
              </div>
              <p className="font-medium text-indigo-600">
                Rp {product.revenue.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Transaksi Terbaru</h2>
        <div className="space-y-4">
          {filteredTransactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">No. {transaction.id}</p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.timestamp).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-medium text-indigo-600">
                  Rp {transaction.total.toLocaleString()}
                </p>
                <button
                  onClick={() => setCurrentReceipt(transaction)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Lihat Resi"
                >
                  <Eye size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
