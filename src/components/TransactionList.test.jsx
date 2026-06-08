import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionList from './TransactionList';

const make = (overrides = {}) => ({
  id: crypto.randomUUID(),
  description: 'Café',
  amount: 5,
  category: 'Food',
  date: '2026-06-01',
  ...overrides,
});

function setup(transactions = [], handlers = {}) {
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  render(<TransactionList transactions={transactions} onEdit={onEdit} onDelete={onDelete} {...handlers} />);
  return { onEdit, onDelete };
}

describe('TransactionList — lista vazia', () => {
  it('exibe mensagem de estado vazio', () => {
    setup([]);
    expect(screen.getByText(/Nenhuma despesa neste mês/)).toBeInTheDocument();
  });

  it('não renderiza a tag ul quando está vazia', () => {
    setup([]);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});

describe('TransactionList — com transações', () => {
  it('renderiza todas as transações', () => {
    setup([make({ description: 'Almoço' }), make({ description: 'Uber' })]);
    expect(screen.getByText('Almoço')).toBeInTheDocument();
    expect(screen.getByText('Uber')).toBeInTheDocument();
  });

  it('ordena por data decrescente', () => {
    setup([
      make({ description: 'Antiga', date: '2026-06-01' }),
      make({ description: 'Nova', date: '2026-06-10' }),
    ]);
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Nova');
    expect(items[1]).toHaveTextContent('Antiga');
  });

  it('exibe o badge de categoria correto', () => {
    setup([make({ category: 'Transport' })]);
    expect(screen.getByText('Transport')).toBeInTheDocument();
  });

  it('chama onEdit com o objeto de transação ao clicar em Editar', async () => {
    const tx = make({ description: 'Gym' });
    const { onEdit } = setup([tx]);
    await userEvent.click(screen.getByTitle('Editar'));
    expect(onEdit).toHaveBeenCalledWith(tx);
  });

  it('chama onDelete com o id correto após confirmação', async () => {
    const tx = make({ description: 'Cinema' });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { onDelete } = setup([tx]);
    await userEvent.click(screen.getByTitle('Excluir'));
    expect(onDelete).toHaveBeenCalledWith(tx.id);
  });

  it('não chama onDelete quando o usuário cancela a confirmação', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { onDelete } = setup([make()]);
    await userEvent.click(screen.getByTitle('Excluir'));
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('exibe os botões de editar e excluir para cada item', () => {
    setup([make(), make()]);
    expect(screen.getAllByTitle('Editar')).toHaveLength(2);
    expect(screen.getAllByTitle('Excluir')).toHaveLength(2);
  });
});
