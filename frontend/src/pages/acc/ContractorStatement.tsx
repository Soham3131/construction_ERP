import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const ContractorStatement: React.FC = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [statement, setStatement] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch contractor accounts (Sundry Creditors)
    const fetchAccounts = async () => {
      try {
        const res = await api.get('/api/accounting/accounts?subType=Sundry Creditors');
        setAccounts(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAccounts();
  }, []);

  const fetchStatement = async (accountId: string) => {
    if (!accountId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/accounting/accounts/${accountId}/statement`);
      setStatement(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Contractor Account Statement</h1>
      
      <div className="mb-6 max-w-sm">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Contractor Ledger</label>
        <select 
          value={selectedAccountId}
          onChange={(e) => {
            setSelectedAccountId(e.target.value);
            fetchStatement(e.target.value);
          }}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white p-2.5 border"
        >
          <option value="">-- Select Contractor --</option>
          {accounts.map(acc => (
            <option key={acc._id} value={acc._id}>{acc.name} ({acc.accountNumber})</option>
          ))}
        </select>
      </div>

      {loading && <div className="text-gray-500">Loading statement...</div>}

      {statement && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{statement.account.name}</h2>
              <p className="text-sm text-gray-500">Closing Balance: ₹{statement.account.currentBalance.toLocaleString()} Cr</p>
            </div>
            <button className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              Export PDF
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-white dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Particulars</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vch Type</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Debit (₹)</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Credit (₹)</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {statement.statement.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{new Date(row.date).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    <div>{row.narration}</div>
                    {row.project && <div className="text-xs text-blue-500 mt-1">Project: {row.project}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{row.type}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-gray-100">{row.dr > 0 ? row.dr.toLocaleString() : ''}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-gray-100">{row.cr > 0 ? row.cr.toLocaleString() : ''}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-gray-900 dark:text-gray-100">{row.balance.toLocaleString()} Cr</td>
                </tr>
              ))}
              {statement.statement.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No transactions found for this account.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContractorStatement;
