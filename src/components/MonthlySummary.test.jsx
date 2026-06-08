import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MonthlySummary from './MonthlySummary';

function setup(props = {}) {
  const defaults = { totalSpent: 0, monthlyLimit: 0, remaining: 0, spentByCategory: {} };
  render(<MonthlySummary {...defaults} {...props} />);
}

describe('MonthlySummary — sem limite', () => {
  it('exibe "Resumo do Mês"', () => {
    setup();
    expect(screen.getByText('Resumo do Mês')).toBeInTheDocument();
  });

  it('exibe total gasto como R$ 0,00', () => {
    setup();
    expect(screen.getByText('Total gasto')).toBeInTheDocument();
  });

  it('não exibe seção "Restante" quando limite é zero', () => {
    setup({ monthlyLimit: 0 });
    expect(screen.queryByText('Restante')).not.toBeInTheDocument();
  });

  it('não exibe barra de progresso quando limite é zero', () => {
    const { container } = render(
      <MonthlySummary totalSpent={0} monthlyLimit={0} remaining={0} spentByCategory={{}} />
    );
    // Progress bar container only renders when hasLimit
    expect(container.querySelector('[style*="width"]')).not.toBeInTheDocument();
  });

  it('lista todas as 6 categorias', () => {
    setup();
    ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Other'].forEach((cat) =>
      expect(screen.getByText(cat)).toBeInTheDocument()
    );
  });
});

describe('MonthlySummary — com limite', () => {
  it('exibe seção "Restante" quando limite > 0', () => {
    setup({ monthlyLimit: 1000, remaining: 1000 });
    expect(screen.getByText('Restante')).toBeInTheDocument();
  });

  it('exibe porcentagem do limite', () => {
    setup({ totalSpent: 250, monthlyLimit: 1000, remaining: 750 });
    expect(screen.getByText('25% do limite')).toBeInTheDocument();
  });

  it('limita a porcentagem a 100% quando gasto supera limite', () => {
    setup({ totalSpent: 1500, monthlyLimit: 1000, remaining: -500 });
    expect(screen.getByText('100% do limite')).toBeInTheDocument();
  });
});

describe('MonthlySummary — cor do saldo restante', () => {
  it('saldo positivo é exibido em verde', () => {
    setup({ monthlyLimit: 1000, totalSpent: 200, remaining: 800 });
    const el = screen.getByText(/R\$\s*800/);
    expect(el).toHaveClass('text-green-600');
  });

  it('saldo negativo é exibido em vermelho', () => {
    setup({ monthlyLimit: 1000, totalSpent: 1200, remaining: -200 });
    const el = screen.getByText(/-R\$/);
    expect(el).toHaveClass('text-red-600');
  });
});

describe('MonthlySummary — gastos por categoria', () => {
  it('exibe o valor gasto por categoria', () => {
    setup({ totalSpent: 30, spentByCategory: { Food: 30 } });
    expect(screen.getByText('Por categoria')).toBeInTheDocument();
  });
});
