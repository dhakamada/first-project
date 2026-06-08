import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTransactions } from './useTransactions';

const MONTH = '2026-06';
const tx = (overrides = {}) => ({
  description: 'Café',
  amount: 5,
  category: 'Food',
  date: `${MONTH}-01`,
  ...overrides,
});

beforeEach(() => {
  localStorage.clear();
  // Fix current month so filters are deterministic
  vi.setSystemTime(new Date('2026-06-15'));
});

afterEach(() => vi.useRealTimers());

describe('initial state', () => {
  it('starts with empty transactions and zero totals', () => {
    const { result } = renderHook(() => useTransactions());
    expect(result.current.filteredTransactions).toEqual([]);
    expect(result.current.totalSpent).toBe(0);
    expect(result.current.monthlyLimit).toBe(0);
    expect(result.current.remaining).toBe(0);
    expect(result.current.spentByCategory).toEqual({});
  });

  it('loads persisted transactions from localStorage', () => {
    const stored = [{ id: 'abc', ...tx() }];
    localStorage.setItem('budget_transactions', JSON.stringify(stored));
    const { result } = renderHook(() => useTransactions());
    expect(result.current.filteredTransactions).toHaveLength(1);
    expect(result.current.totalSpent).toBe(5);
  });

  it('loads persisted monthly limit from localStorage', () => {
    localStorage.setItem('budget_monthly_limit', '1000');
    const { result } = renderHook(() => useTransactions());
    expect(result.current.monthlyLimit).toBe(1000);
    expect(result.current.remaining).toBe(1000);
  });
});

describe('addTransaction', () => {
  it('appends transaction and saves to localStorage', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => result.current.addTransaction(tx()));
    expect(result.current.filteredTransactions).toHaveLength(1);
    expect(result.current.filteredTransactions[0]).toMatchObject(tx());
    expect(result.current.filteredTransactions[0].id).toBeDefined();
    const saved = JSON.parse(localStorage.getItem('budget_transactions'));
    expect(saved).toHaveLength(1);
  });

  it('updates totalSpent after adding', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => result.current.addTransaction(tx({ amount: 30 })));
    act(() => result.current.addTransaction(tx({ amount: 20 })));
    expect(result.current.totalSpent).toBe(50);
  });

  it('multiple transactions get unique ids', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => result.current.addTransaction(tx()));
    act(() => result.current.addTransaction(tx()));
    const [a, b] = result.current.filteredTransactions;
    expect(a.id).not.toBe(b.id);
  });
});

describe('updateTransaction', () => {
  it('replaces the transaction by id and saves', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => result.current.addTransaction(tx({ amount: 10 })));
    const id = result.current.filteredTransactions[0].id;
    act(() => result.current.updateTransaction(id, tx({ amount: 99, description: 'Updated' })));
    expect(result.current.filteredTransactions[0].amount).toBe(99);
    expect(result.current.filteredTransactions[0].description).toBe('Updated');
    const saved = JSON.parse(localStorage.getItem('budget_transactions'));
    expect(saved[0].amount).toBe(99);
  });

  it('does not change list length', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => result.current.addTransaction(tx()));
    act(() => result.current.addTransaction(tx()));
    const id = result.current.filteredTransactions[0].id;
    act(() => result.current.updateTransaction(id, tx({ amount: 1 })));
    expect(result.current.filteredTransactions).toHaveLength(2);
  });
});

describe('deleteTransaction', () => {
  it('removes transaction by id and saves', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => result.current.addTransaction(tx({ description: 'A' })));
    act(() => result.current.addTransaction(tx({ description: 'B' })));
    const id = result.current.filteredTransactions[0].id;
    act(() => result.current.deleteTransaction(id));
    expect(result.current.filteredTransactions).toHaveLength(1);
    const saved = JSON.parse(localStorage.getItem('budget_transactions'));
    expect(saved).toHaveLength(1);
  });

  it('resets totalSpent accordingly', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => result.current.addTransaction(tx({ amount: 50 })));
    const id = result.current.filteredTransactions[0].id;
    act(() => result.current.deleteTransaction(id));
    expect(result.current.totalSpent).toBe(0);
  });
});

describe('setMonthlyLimit', () => {
  it('updates monthlyLimit state and saves to localStorage', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => result.current.setMonthlyLimit(500));
    expect(result.current.monthlyLimit).toBe(500);
    expect(localStorage.getItem('budget_monthly_limit')).toBe('500');
  });

  it('updates remaining correctly', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => result.current.addTransaction(tx({ amount: 100 })));
    act(() => result.current.setMonthlyLimit(300));
    expect(result.current.remaining).toBe(200);
  });
});

describe('month filtering', () => {
  it('filteredTransactions only includes transactions for selectedMonth', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => result.current.addTransaction(tx({ date: '2026-06-10' })));
    act(() => result.current.addTransaction(tx({ date: '2026-05-15' })));
    expect(result.current.filteredTransactions).toHaveLength(1);
    expect(result.current.filteredTransactions[0].date).toBe('2026-06-10');
  });

  it('setSelectedMonth switches the visible transactions', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => result.current.addTransaction(tx({ date: '2026-06-01' })));
    act(() => result.current.addTransaction(tx({ date: '2026-05-01' })));
    act(() => result.current.setSelectedMonth('2026-05'));
    expect(result.current.filteredTransactions).toHaveLength(1);
    expect(result.current.filteredTransactions[0].date).toBe('2026-05-01');
  });

  it('totalSpent only sums selected month', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => result.current.addTransaction(tx({ amount: 50, date: '2026-06-01' })));
    act(() => result.current.addTransaction(tx({ amount: 200, date: '2026-05-01' })));
    expect(result.current.totalSpent).toBe(50);
  });
});

describe('spentByCategory', () => {
  it('groups amounts by category', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => result.current.addTransaction(tx({ amount: 10, category: 'Food' })));
    act(() => result.current.addTransaction(tx({ amount: 20, category: 'Food' })));
    act(() => result.current.addTransaction(tx({ amount: 15, category: 'Transport' })));
    expect(result.current.spentByCategory.Food).toBe(30);
    expect(result.current.spentByCategory.Transport).toBe(15);
    expect(result.current.spentByCategory.Housing).toBeUndefined();
  });
});
