export const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Other'];

export function loadTransactions() {
  try {
    return JSON.parse(localStorage.getItem('budget_transactions') || '[]');
  } catch {
    return [];
  }
}

export function saveTransactions(transactions) {
  localStorage.setItem('budget_transactions', JSON.stringify(transactions));
}

export function loadMonthlyLimit() {
  return Number(localStorage.getItem('budget_monthly_limit') || '0');
}

export function saveMonthlyLimit(limit) {
  localStorage.setItem('budget_monthly_limit', String(limit));
}
