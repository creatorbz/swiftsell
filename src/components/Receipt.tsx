import { Transaction } from '../types';
import { X, Printer, Store } from 'lucide-react';

interface ReceiptProps {
  transaction: Transaction;
  onClose: () => void;
}

export function Receipt({ transaction, onClose }: ReceiptProps) {
  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content');
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent?.innerHTML || '';
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center mb-4 pb-2 border-b">
          <h2 className="text-lg font-bold text-gray-800">Struk Pembayaran</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="btn-secondary p-1.5">
              <Printer size={16} />
            </button>
            <button onClick={onClose} className="btn-secondary p-1.5">
              <X size={16} />
            </button>
          </div>
        </div>

        <div id="receipt-content" className="space-y-4 text-sm">
          <div className="text-center pb-4">
            <div className="flex justify-center mb-2">
              <Store size={24} className="text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold text-indigo-600">SwiftSell</h1>
            <p className="text-xs text-gray-500 mt-1">
              Jl. Contoh No. 123, Kota Contoh
            </p>
            <div className="mt-2 text-xs text-gray-600">
              <p>No. Transaksi: {transaction.id}</p>
              <p>{new Date(transaction.timestamp).toLocaleString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-gray-800 text-xs">Detail Pembelian:</h3>
            {transaction.items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-xs">
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-gray-500">
                    {item.quantity} x Rp {(item.isWholesale ? item.product.wholesalePrice : item.product.price).toLocaleString()}
                    {item.isWholesale && ' (Grosir)'}
                  </p>
                </div>
                <p className="font-medium">
                  Rp {(item.quantity * (item.isWholesale ? item.product.wholesalePrice : item.product.price)).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between items-center">
              <p className="font-medium text-gray-800">Total Pembayaran</p>
              <p className="text-lg font-bold text-indigo-600">
                Rp {transaction.total.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="text-center border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-600 font-medium">Terima kasih atas kunjungan Anda</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Barang yang sudah dibeli tidak dapat dikembalikan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
