import React, { useState, useEffect } from 'react';
import api from '../../api/client';

interface Account {
  _id: string;
  name: string;
  type: string;
}

interface Voucher {
  _id: string;
  voucherNumber: string;
  date: string;
  type: string;
  narration: string;
  entries: { account: Account; dr: number; cr: number }[];
}

const VoucherEntry: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVouchers = async () => {
    try {
      const res = await api.get('/api/accounting/vouchers');
      setVouchers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Daybook / Vouchers</h1>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading vouchers...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Voucher No</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Particulars (Debit/Credit)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {vouchers.map(v => (
                <tr key={v._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {new Date(v.date).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{v.voucherNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${v.type === 'JOURNAL' ? 'bg-purple-100 text-purple-800' : 
                        v.type === 'PAYMENT' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {v.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="space-y-1">
                      {v.entries.map((e, idx) => (
                        <div key={idx} className="flex justify-between w-64">
                          <span className={e.cr > 0 ? 'ml-4 italic' : 'font-medium'}>
                            {e.cr > 0 ? 'To ' : 'By '} {e.account?.name}
                          </span>
                          <span className="font-mono text-xs">
                            {e.dr > 0 ? `₹${e.dr} Dr` : `₹${e.cr} Cr`}
                          </span>
                        </div>
                      ))}
                      <div className="text-xs text-gray-400 mt-2 italic">({v.narration})</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VoucherEntry;
