import CategoryBadge from './CategoryBadge';

function fmt(amount) {
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function TransactionList({ transactions, onEdit, onDelete }) {
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  if (!sorted.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400 text-sm">
        Nenhuma despesa neste mês. Adicione a primeira acima!
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-800">Despesas</h2>
      </div>
      <ul className="divide-y divide-gray-100">
        {sorted.map((t) => (
          <li key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{t.description}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')}
              </p>
            </div>
            <CategoryBadge category={t.category} />
            <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">{fmt(t.amount)}</span>
            <button
              onClick={() => onEdit(t)}
              title="Editar"
              className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Excluir "${t.description}"?`)) onDelete(t.id);
              }}
              title="Excluir"
              className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
