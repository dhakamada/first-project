import { useState } from 'react';
import { useTransactions } from './hooks/useTransactions';
import MonthlySummary from './components/MonthlySummary';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import YearlyHistory from './components/YearlyHistory';

export default function App() {
  const {
    transactions,
    filteredTransactions,
    totalSpent,
    spentByCategory,
    remaining,
    monthlyLimit,
    selectedMonth,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setMonthlyLimit,
    setSelectedMonth,
  } = useTransactions();

  const [editingTransaction, setEditingTransaction] = useState(null);
  const [limitInput, setLimitInput] = useState('');
  const [activeTab, setActiveTab] = useState('tracker');

  function handleSubmit(formData) {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, formData);
      setEditingTransaction(null);
    } else {
      addTransaction(formData);
    }
  }

  function handleLimitSubmit(ev) {
    ev.preventDefault();
    const val = Number(limitInput);
    if (val >= 0) { setMonthlyLimit(val); setLimitInput(''); }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <h1 className="text-xl font-bold text-gray-900">Rastreador de Orçamento</h1>
            </div>

            {/* Tab navigation */}
            <div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
              <button
                onClick={() => setActiveTab('tracker')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'tracker'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Rastreador
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'history'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Histórico
              </button>
            </div>
          </div>

          {/* Tracker-only controls */}
          {activeTab === 'tracker' && (
            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <form onSubmit={handleLimitSubmit} className="flex gap-2 items-center">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={monthlyLimit ? `Limite: R$ ${monthlyLimit}` : 'Definir limite (R$)'}
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  className="w-44 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  OK
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4">
        {activeTab === 'tracker' ? (
          <>
            <MonthlySummary
              totalSpent={totalSpent}
              monthlyLimit={monthlyLimit}
              remaining={remaining}
              spentByCategory={spentByCategory}
            />
            <TransactionForm
              onSubmit={handleSubmit}
              editingTransaction={editingTransaction}
              onCancel={() => setEditingTransaction(null)}
            />
            <TransactionList
              transactions={filteredTransactions}
              onEdit={setEditingTransaction}
              onDelete={deleteTransaction}
            />
          </>
        ) : (
          <YearlyHistory transactions={transactions} />
        )}
      </main>
    </div>
  );
}
