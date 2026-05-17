import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const TrialBalance: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get('/api/accounting/reports/trial-balance');
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Trial Balance</h1>
          <p className="text-sm text-gray-500 mt-1">As of {new Date().toLocaleDateString('en-IN')}</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Export Report
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading Trial Balance...</div>
      ) : data ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200">Particulars</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-200">Debit (₹)</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-200">Credit (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {['ASSET', 'EXPENSE', 'LIABILITY', 'REVENUE', 'EQUITY'].map(type => {
                const groupAccounts = data.accounts.filter((a: any) => a.type === type);
                if (groupAccounts.length === 0) return null;
                return (
                  <React.Fragment key={type}>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      <td colSpan={3} className="px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">{type}</td>
                    </tr>
                    {groupAccounts.map((acc: any) => (
                      <tr key={acc._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-3 text-sm text-gray-800 dark:text-gray-200 pl-10">{acc.name}</td>
                        <td className="px-6 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">{acc.dr > 0 ? acc.dr.toLocaleString() : ''}</td>
                        <td className="px-6 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">{acc.cr > 0 ? acc.cr.toLocaleString() : ''}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
              <tr className="bg-gray-100 dark:bg-gray-900 border-t-2 border-gray-300 dark:border-gray-600">
                <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white text-right uppercase">Grand Total</td>
                <td className="px-6 py-4 text-sm font-bold text-right text-gray-900 dark:text-white">₹{data.totalDebit.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm font-bold text-right text-gray-900 dark:text-white">₹{data.totalCredit.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          {Math.abs(data.totalDebit - data.totalCredit) > 0.01 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium text-center border-t border-red-200 dark:border-red-800">
              Warning: Trial Balance is not tallied! Difference: ₹{Math.abs(data.totalDebit - data.totalCredit).toLocaleString()}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default TrialBalance;
