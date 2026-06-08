import { useState, useMemo } from 'react';
import CategoryBadge from './CategoryBadge';
import { CATEGORIES } from '../utils/storage';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function fmt(amount) {
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function YearlyHistory({ transactions }) {
  const currentYear = new Date().getFullYear();

  const availableYears = useMemo(() => {
    const years = new Set(transactions.map((t) => Number(t.date.slice(0, 4))));
    years.add(currentYear);
    return [...years].sort((a, b) => b - a);
  }, [transactions, currentYear]);

  const [selectedYear, setSelectedYear] = useState(currentYear);

  const monthlyData = useMemo(() => {
    return MONTH_NAMES.map((name, i) => {
      const prefix = `${selectedYear}-${pad(i + 1)}`;
      const monthTx = transactions.filter((t) => t.date.startsWith(prefix));
      const total = monthTx.reduce((s, t) => s + t.amount, 0);
      const byCategory = {};
      monthTx.forEach((t) => {
        byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
      });
      return { name, prefix, total, byCategory, count: monthTx.length };
    });
  }, [transactions, selectedYear]);

  const yearTotal = useMemo(
    () => monthlyData.reduce((s, m) => s + m.total, 0),
    [monthlyData]
  );

  const maxMonthTotal = useMemo(
    () => Math.max(...monthlyData.map((m) => m.total), 1),
    [monthlyData]
  );

  const [expandedMonth, setExpandedMonth] = useState(null);

  return (
    <div className="flex flex-col gap-4">
      {/* Year selector + yearly total */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Histórico de Gastos</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedYear((y) => y - 1)}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Ano anterior"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button
              onClick={() => setSelectedYear((y) => y + 1)}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Próximo ano"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total {selectedYear}</p>
            <p className="text-2xl font-bold text-gray-900">{fmt(yearTotal)}</p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Média mensal</p>
            <p className="text-2xl font-bold text-gray-900">
              {fmt(yearTotal / 12)}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800">Meses</p>
        </div>
        <ul className="divide-y divide-gray-100">
          {monthlyData.map((month, i) => {
            const isExpanded = expandedMonth === i;
            const pct = (month.total / maxMonthTotal) * 100;
            const isCurrentMonth =
              month.prefix === new Date().toISOString().slice(0, 7);

            return (
              <li key={month.prefix}>
                <button
                  onClick={() => setExpandedMonth(isExpanded ? null : i)}
                  className="w-full flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-24 flex-shrink-0">
                    <span className={`text-sm font-medium ${month.total > 0 ? 'text-gray-800' : 'text-gray-400'}`}>
                      {month.name}
                    </span>
                    {isCurrentMonth && (
                      <span className="ml-1.5 text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-medium">
                        atual
                      </span>
                    )}
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    {month.total > 0 && (
                      <div
                        className="h-full bg-indigo-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    )}
                  </div>
                  <div className="w-28 text-right">
                    <span className={`text-sm font-semibold ${month.total > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                      {fmt(month.total)}
                    </span>
                    {month.count > 0 && (
                      <p className="text-xs text-gray-400">{month.count} despesa{month.count !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 text-gray-300 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && month.total > 0 && (
                  <div className="px-5 pb-4 pt-1 bg-gray-50 border-t border-gray-100">
                    <div className="space-y-1.5">
                      {CATEGORIES.filter((cat) => month.byCategory[cat]).map((cat) => (
                        <div key={cat} className="flex items-center gap-3">
                          <CategoryBadge category={cat} />
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gray-400 rounded-full"
                              style={{ width: `${(month.byCategory[cat] / month.total) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700 w-20 text-right">
                            {fmt(month.byCategory[cat])}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isExpanded && month.total === 0 && (
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-400">
                    Sem despesas em {month.name.toLowerCase()} de {selectedYear}.
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* Year total footer */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">Total {selectedYear}</span>
          <span className="text-base font-bold text-gray-900">{fmt(yearTotal)}</span>
        </div>
      </div>
    </div>
  );
}
