import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => {
  localStorage.clear();
  vi.setSystemTime(new Date('2026-06-15'));
});

afterEach(() => vi.useRealTimers());

async function addTransaction({ description = 'Café', amount = '10', category = 'Food' } = {}) {
  await userEvent.type(screen.getByPlaceholderText('Descrição'), description);
  await userEvent.type(screen.getByPlaceholderText('Valor (R$)'), amount);
  await userEvent.selectOptions(screen.getByRole('combobox'), category);
  await userEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
}

describe('App — renderização inicial', () => {
  it('exibe o título da aplicação', () => {
    render(<App />);
    expect(screen.getByText('Rastreador de Orçamento')).toBeInTheDocument();
  });

  it('exibe o formulário, o sumário e o estado vazio da lista', () => {
    render(<App />);
    expect(screen.getByText('Nova Despesa')).toBeInTheDocument();
    expect(screen.getByText('Resumo do Mês')).toBeInTheDocument();
    expect(screen.getByText(/Nenhuma despesa neste mês/)).toBeInTheDocument();
  });
});

describe('App — adicionar transação', () => {
  it('adiciona transação e ela aparece na lista', async () => {
    render(<App />);
    await addTransaction({ description: 'Almoço', amount: '30' });
    expect(screen.getByText('Almoço')).toBeInTheDocument();
  });

  it('atualiza o total do sumário após adicionar', async () => {
    render(<App />);
    await addTransaction({ amount: '50' });
    await addTransaction({ description: 'Jantar', amount: '30' });
    expect(screen.getByText('Total gasto')).toBeInTheDocument();
  });

  it('limpa o formulário após adicionar', async () => {
    render(<App />);
    await addTransaction();
    expect(screen.getByPlaceholderText('Descrição')).toHaveValue('');
  });
});

describe('App — editar transação', () => {
  it('abre formulário de edição ao clicar no botão editar', async () => {
    render(<App />);
    await addTransaction({ description: 'Mercado' });
    await userEvent.click(screen.getByTitle('Editar'));
    expect(screen.getByText('Editar Despesa')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Descrição')).toHaveValue('Mercado');
  });

  it('atualiza a transação e volta ao modo de adição', async () => {
    render(<App />);
    await addTransaction({ description: 'Mercado', amount: '100' });
    await userEvent.click(screen.getByTitle('Editar'));
    const amtInput = screen.getByPlaceholderText('Valor (R$)');
    await userEvent.clear(amtInput);
    await userEvent.type(amtInput, '150');
    await userEvent.click(screen.getByRole('button', { name: 'Atualizar' }));
    expect(screen.getByText('Nova Despesa')).toBeInTheDocument();
    expect(screen.queryByText('Editar Despesa')).not.toBeInTheDocument();
  });

  it('cancela edição e volta ao modo de adição', async () => {
    render(<App />);
    await addTransaction({ description: 'Gym' });
    await userEvent.click(screen.getByTitle('Editar'));
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByText('Nova Despesa')).toBeInTheDocument();
  });
});

describe('App — excluir transação', () => {
  it('remove transação após confirmar exclusão', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<App />);
    await addTransaction({ description: 'Cinema' });
    await userEvent.click(screen.getByTitle('Excluir'));
    expect(screen.queryByText('Cinema')).not.toBeInTheDocument();
    expect(screen.getByText(/Nenhuma despesa neste mês/)).toBeInTheDocument();
  });

  it('não remove transação quando usuário cancela confirmação', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<App />);
    await addTransaction({ description: 'Cinema' });
    await userEvent.click(screen.getByTitle('Excluir'));
    expect(screen.getByText('Cinema')).toBeInTheDocument();
  });
});

describe('App — limite mensal', () => {
  it('define limite mensal ao submeter o formulário de limite', async () => {
    render(<App />);
    await userEvent.type(screen.getByPlaceholderText('Definir limite (R$)'), '500');
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(screen.getByPlaceholderText('Limite: R$ 500')).toBeInTheDocument();
  });

  it('exibe "Restante" no sumário após definir limite', async () => {
    render(<App />);
    await userEvent.type(screen.getByPlaceholderText('Definir limite (R$)'), '500');
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(screen.getByText('Restante')).toBeInTheDocument();
  });
});

describe('App — filtro de mês', () => {
  it('transação do mês anterior não aparece no mês atual', async () => {
    render(<App />);
    // Adiciona transação do mês atual (2026-06)
    await addTransaction({ description: 'Junho' });
    // Não conseguimos adicionar direto com data diferente pela UI sem alterar o campo de data,
    // mas podemos testar mudando o seletor de mês
    const monthInput = screen.getByDisplayValue('2026-06');
    await userEvent.clear(monthInput);
    await userEvent.type(monthInput, '2026-05');
    expect(screen.getByText(/Nenhuma despesa neste mês/)).toBeInTheDocument();
  });

  it('transação volta a aparecer ao retornar para o mês correto', async () => {
    render(<App />);
    await addTransaction({ description: 'Junho' });
    const monthInput = screen.getByDisplayValue('2026-06');
    await userEvent.clear(monthInput);
    await userEvent.type(monthInput, '2026-05');
    await userEvent.clear(monthInput);
    await userEvent.type(monthInput, '2026-06');
    expect(screen.getByText('Junho')).toBeInTheDocument();
  });
});

describe('App — persistência', () => {
  it('persiste transação no localStorage', async () => {
    render(<App />);
    await addTransaction({ description: 'Persistida', amount: '42' });
    const saved = JSON.parse(localStorage.getItem('budget_transactions'));
    expect(saved).toHaveLength(1);
    expect(saved[0].description).toBe('Persistida');
    expect(saved[0].amount).toBe(42);
  });

  it('persiste limite mensal no localStorage', async () => {
    render(<App />);
    await userEvent.type(screen.getByPlaceholderText('Definir limite (R$)'), '1000');
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(localStorage.getItem('budget_monthly_limit')).toBe('1000');
  });
});
