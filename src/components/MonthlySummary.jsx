import { CATEGORIES } from '../utils/storage';
import CategoryBadge from './CategoryBadge';

function fmt(amount) {
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const DOTS = {
  Food: 'bg-green-500',
  Transport: 'bg-blue-500',
  Housing: 'bg-amber-500',
  Entertainment: 'bg-purple-500',
  Health: 'bg-red-500',
  Other: 'bg-gray-400',
};

export default function MonthlySummary({ totalSpent, monthlyLimit, remaining, spentByCategory }) {
  const hasLimit = monthlyLimit > 0;
  const pct = hasLimit ? Math.min((totalSpent / monthlyLimit) * 100, 100) : 0;
  const barColor = pct < 75 ? 'bg-green-500' : pct < 100 ? 'bg-yellow-500' : 'bg-red-500';
  const remainingColor = remaining >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h2 className="text-base font-semibold text-gray-800 mb-4">Resumo do Mês</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1 bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Total gasto</p>
          <p className="text-2xl font-bold text-gray-900">{fmt(totalSpent)}</p>
          {hasLimit && (
            <p className="text-xs text-gray-400 mt-1">de {fmt(monthlyLimit)}</p>
          )}
        </div>
        {hasLimit && (
          <div className="flex-1 bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Restante</p>
            <p className={`text-2xl font-bold ${remainingColor}`}>{fmt(remaining)}</p>
            <p className="text-xs text-gray-400 mt-1">{pct.toFixed(0)}% do limite</p>
          </div>
        )}
      </div>

      {hasLimit && (
        <div className="mb-5">
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Por categoria</p>
        {CATEGORIES.map((cat) => {
          const amount = spentByCategory[cat] || 0;
          return (
            <div key={cat} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${DOTS[cat]}`} />
              <CategoryBadge category={cat} />
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                {totalSpent > 0 && (
                  <div
                    className={`h-full rounded-full ${DOTS[cat]}`}
                    style={{ width: `${(amount / totalSpent) * 100}%` }}
                  />
                )}
              </div>
              <span className={`text-sm font-medium whitespace-nowrap ${amount ? 'text-gray-800' : 'text-gray-300'}`}>
                {fmt(amount)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
