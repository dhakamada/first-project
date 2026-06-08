import { describe, it, expect, beforeEach } from 'vitest';
import {
  CATEGORIES,
  loadTransactions,
  saveTransactions,
  loadMonthlyLimit,
  saveMonthlyLimit,
} from './storage';

beforeEach(() => localStorage.clear());

describe('CATEGORIES', () => {
  it('contains exactly the 6 expected categories', () => {
    expect(CATEGORIES).toEqual(['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Other']);
  });
});

describe('loadTransactions', () => {
  it('returns empty array when localStorage is empty', () => {
    expect(loadTransactions()).toEqual([]);
  });

  it('returns parsed array from localStorage', () => {
    const tx = [{ id: '1', description: 'Café', amount: 5, category: 'Food', date: '2026-06-01' }];
    localStorage.setItem('budget_transactions', JSON.stringify(tx));
    expect(loadTransactions()).toEqual(tx);
  });

  it('returns empty array when localStorage contains invalid JSON', () => {
    localStorage.setItem('budget_transactions', 'not-json{');
    expect(loadTransactions()).toEqual([]);
  });
});

describe('saveTransactions', () => {
  it('persists array as JSON in localStorage', () => {
    const tx = [{ id: '1', description: 'Almoço', amount: 30, category: 'Food', date: '2026-06-01' }];
    saveTransactions(tx);
    expect(JSON.parse(localStorage.getItem('budget_transactions'))).toEqual(tx);
  });

  it('overwrites previous value', () => {
    saveTransactions([{ id: '1' }]);
    saveTransactions([{ id: '2' }]);
    expect(JSON.parse(localStorage.getItem('budget_transactions'))).toEqual([{ id: '2' }]);
  });
});

describe('loadMonthlyLimit', () => {
  it('returns 0 when localStorage is empty', () => {
    expect(loadMonthlyLimit()).toBe(0);
  });

  it('returns the stored number', () => {
    localStorage.setItem('budget_monthly_limit', '1500');
    expect(loadMonthlyLimit()).toBe(1500);
  });

  it('handles decimal values', () => {
    localStorage.setItem('budget_monthly_limit', '999.99');
    expect(loadMonthlyLimit()).toBe(999.99);
  });
});

describe('saveMonthlyLimit', () => {
  it('persists value as string in localStorage', () => {
    saveMonthlyLimit(2000);
    expect(localStorage.getItem('budget_monthly_limit')).toBe('2000');
  });

  it('handles zero', () => {
    saveMonthlyLimit(0);
    expect(localStorage.getItem('budget_monthly_limit')).toBe('0');
  });
});
