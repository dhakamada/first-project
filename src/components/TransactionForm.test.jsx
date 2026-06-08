import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionForm from './TransactionForm';

const editingTx = {
  id: 'abc',
  description: 'Almoço',
  amount: 45.9,
  category: 'Food',
  date: '2026-06-03',
};

function setup(props = {}) {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  render(<TransactionForm onSubmit={onSubmit} onCancel={onCancel} editingTransaction={null} {...props} />);
  return { onSubmit, onCancel };
}

describe('TransactionForm — modo adicionar', () => {
  it('exibe título "Nova Despesa"', () => {
    setup();
    expect(screen.getByText('Nova Despesa')).toBeInTheDocument();
  });

  it('exibe botão "Adicionar" sem botão "Cancelar"', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
  });

  it('exibe erros ao submeter com campos vazios', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(screen.getByText('Obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Deve ser maior que zero')).toBeInTheDocument();
  });

  it('não chama onSubmit quando há erros de validação', async () => {
    const { onSubmit } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('chama onSubmit com dados corretos em formulário válido', async () => {
    const { onSubmit } = setup();
    await userEvent.type(screen.getByPlaceholderText('Descrição'), 'Café');
    await userEvent.type(screen.getByPlaceholderText('Valor (R$)'), '5.50');
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Café', amount: 5.5, category: 'Food' })
    );
  });

  it('limpa o formulário após submit bem-sucedido', async () => {
    setup();
    const descInput = screen.getByPlaceholderText('Descrição');
    await userEvent.type(descInput, 'Teste');
    await userEvent.type(screen.getByPlaceholderText('Valor (R$)'), '10');
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(descInput).toHaveValue('');
  });

  it('remove erro de descrição ao digitar', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(screen.getByText('Obrigatório')).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText('Descrição'), 'x');
    expect(screen.queryByText('Obrigatório')).not.toBeInTheDocument();
  });

  it('faz trim do espaço em branco na descrição', async () => {
    const { onSubmit } = setup();
    await userEvent.type(screen.getByPlaceholderText('Descrição'), '  Almoço  ');
    await userEvent.type(screen.getByPlaceholderText('Valor (R$)'), '20');
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ description: 'Almoço' }));
  });
});

describe('TransactionForm — modo editar', () => {
  it('exibe título "Editar Despesa"', () => {
    setup({ editingTransaction: editingTx });
    expect(screen.getByText('Editar Despesa')).toBeInTheDocument();
  });

  it('exibe botão "Atualizar" e botão "Cancelar"', () => {
    setup({ editingTransaction: editingTx });
    expect(screen.getByRole('button', { name: 'Atualizar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('pré-preenche os campos com os dados da transação', () => {
    setup({ editingTransaction: editingTx });
    expect(screen.getByPlaceholderText('Descrição')).toHaveValue('Almoço');
    expect(screen.getByPlaceholderText('Valor (R$)')).toHaveValue(45.9);
  });

  it('chama onCancel ao clicar em Cancelar', async () => {
    const { onCancel } = setup({ editingTransaction: editingTx });
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('chama onSubmit com dados atualizados', async () => {
    const { onSubmit } = setup({ editingTransaction: editingTx });
    const amtInput = screen.getByPlaceholderText('Valor (R$)');
    await userEvent.clear(amtInput);
    await userEvent.type(amtInput, '99');
    await userEvent.click(screen.getByRole('button', { name: 'Atualizar' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ amount: 99, description: 'Almoço' }));
  });
});
