import { useState, useEffect } from 'react';
import { CATEGORIES } from '../utils/storage';

const today = () => new Date().toISOString().slice(0, 10);

const empty = { description: '', amount: '', category: CATEGORIES[0], date: today() };

export default function TransactionForm({ onSubmit, editingTransaction, onCancel }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingTransaction) {
      setForm({
        description: editingTransaction.description,
        amount: String(editingTransaction.amount),
        category: editingTransaction.category,
        date: editingTransaction.date,
      });
    } else {
      setForm(empty);
    }
    setErrors({});
  }, [editingTransaction]);

  function validate() {
    const e = {};
    if (!form.description.trim()) e.description = 'Obrigatório';
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Deve ser maior que zero';
    return e;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit({ description: form.description.trim(), amount: Number(form.amount), category: form.category, date: form.date });
    setForm(empty);
    setErrors({});
  }

  function field(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  }

  const isEdit = Boolean(editingTransaction);

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h2 className="text-base font-semibold text-gray-800 mb-4">
        {isEdit ? 'Editar Despesa' : 'Nova Despesa'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <input
            type="text"
            placeholder="Descrição"
            value={form.description}
            onChange={(e) => field('description', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>
        <div>
          <input
            type="number"
            placeholder="Valor (R$)"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={(e) => field('amount', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
        </div>
        <div>
          <select
            value={form.category}
            onChange={(e) => field('category', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <input
            type="date"
            value={form.date}
            onChange={(e) => field('date', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          {isEdit ? 'Atualizar' : 'Adicionar'}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
