import { useState, useMemo } from 'react';
import {
  loadTransactions,
  saveTransactions,
  loadMonthlyLimit,
  saveMonthlyLimit,
} from '../utils/storage';

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function useTransactions() {
  const [transactions, setTransactions] = useState(() => loadTransactions());
  const [monthlyLimit, setMonthlyLimitState] = useState(() => loadMonthlyLimit());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const filteredTransactions = useMemo(
    () => transactions.filter((t) => t.date.startsWith(selectedMonth)),
    [transactions, selectedMonth]
  );

  const totalSpent = useMemo(
    () => filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const spentByCategory = useMemo(() => {
    const map = {};
    filteredTransactions.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return map;
  }, [filteredTransactions]);

  const remaining = monthlyLimit - totalSpent;

  function addTransaction(formData) {
    const next = [...transactions, { id: crypto.randomUUID(), ...formData }];
    setTransactions(next);
    saveTransactions(next);
  }

  function updateTransaction(id, formData) {
    const next = transactions.map((t) => (t.id === id ? { id, ...formData } : t));
    setTransactions(next);
    saveTransactions(next);
  }

  function deleteTransaction(id) {
    const next = transactions.filter((t) => t.id !== id);
    setTransactions(next);
    saveTransactions(next);
  }

  function setMonthlyLimit(value) {
    setMonthlyLimitState(value);
    saveMonthlyLimit(value);
  }

  return {
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
  };
}
