import { useEffect, useState } from 'react';
import { Transaction } from '../types';
import { X, Download } from 'lucide-react';

interface SalesJournalProps {
  onClose: () => void;
}

export function SalesJournal({ onClose }: SalesJournalProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const savedTransactions = localStorage.getItem('pos-transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);

  const handleExport = () => {
    const csvContent = [
      ['Tanggal', 'No. Transaksi', 'Items', 'Total'],
      ...transactions.map(t => [
        new Date(t.timestamp).toLocaleString(),
        t.id,
        t.items.map(i => `${i.product.name} (${i.quantity})`).join(', '),
        t.total
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-journal-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Jurnal Penjualan</h2>
            <p className="text-sm text-gray-500 mt-1">Total Penjualan: Rp {totalSales.toLocaleString()}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleExport} className="btn-secondary">
              <Download size={20} />
              Export CSV
            </button>
            <button onClick={onClose} className="btn-secondary p-2">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Belum ada transaksi</p>
            </div>
          ) : (
            transactions.sort((a, b) => b.timestamp - a.timestamp).map((transaction) => (
              <div key={transaction.id} className="card p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-medium text-gray-800">No. {transaction.id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.timestamp).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <p className="font-bold text-indigo-600">
                    Rp {transaction.total.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2">
                  {transaction.items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <div className="flex gap-2">
                        <span className="text-gray-800">{item.product.name}</span>
                        <span className="text-gray-500">x {item.quantity}</span>
                      </div>
                      <span className="text-gray-600">
                        Rp {(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
