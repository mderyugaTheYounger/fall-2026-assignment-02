import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BudgetLimitStrategy } from '../src/strategies/BudgetLimitStrategy.js';
import { BudgetService } from '../src/services/BudgetService.js';
import { Transaction } from '../src/models.js';

describe('BudgetLimitStrategy (Feature 1)', () => {
  let strategy: BudgetLimitStrategy;

  beforeEach(() => {
    strategy = new BudgetLimitStrategy();
    vi.restoreAllMocks();
  });

  // Example of how to write and mock in your tests:
  //
  // it('should correctly identify categories that are over budget', async () => {
  //   // 1. Mock the BudgetService asynchronously
  //   const mockBudgets = { Food: 100, Rent: 1000 };
  //   const spy = vi.spyOn(BudgetService, 'getCategoryBudgets').mockResolvedValue(mockBudgets);
  //
  //   // 2. Set up test transactions
  //   const testTransactions: Transaction[] = [
  //     { id: '1', date: '2026-05-01', amount: -150.00, category: 'Food', description: 'Grocery', status: 'completed' }, // Over budget
  //     { id: '2', date: '2026-05-02', amount: -900.00, category: 'Rent', description: 'Apartment', status: 'completed' }, // Under budget
  //   ];
  //
  //   // 3. Execute
  //   const result = await strategy.execute(testTransactions);
  //
  //   // 4. Assert
  //   expect(spy).toHaveBeenCalled();
  //   expect(result).toContain('Food');
  //   expect(result).toContain('OVER BUDGET'); // or whatever formatting you choose
  //   expect(result).not.toContain('Rent over budget');
  // });

  it('should group expenses correctly by category and sum them', async () => {
    // 1. Mock the BudgetService asynchronously
    const mockBudgets = { Food: 500, Rent: 1000 };
    const spy = vi
      .spyOn(BudgetService, 'getCategoryBudgets')
      .mockResolvedValue(mockBudgets);

    // 2. Set up test transactions - multiple expenses in the same category
    const testTransactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: -50.0, category: 'Food', description: 'Grocery run 1', status: 'completed' },
      { id: '2', date: '2026-05-05', amount: -75.0, category: 'Food', description: 'Grocery run 2', status: 'completed' },
      { id: '3', date: '2026-05-10', amount: -100.0, category: 'Food', description: 'Grocery run 3', status: 'completed' },
      { id: '4', date: '2026-05-02', amount: 2000.0, category: 'Income', description: 'Paycheck', status: 'completed' }, // not an expense, ignored
    ];

    // 3. Execute
    const result = await strategy.execute(testTransactions);

    // 4. Assert - Food expenses (50 + 75 + 100 = 225) are within the 500 limit,
    // so there should be no overage, but the budget service should still have been queried.
    expect(spy).toHaveBeenCalled();
    expect(result).not.toContain('Food');
    expect(result).toContain('All categories are within their budget limits');
  });

  it('should calculate absolute overage amounts and percentage exceeded', async () => {
    // 1. Mock the BudgetService asynchronously
    const mockBudgets = { Food: 100 };
    const spy = vi
      .spyOn(BudgetService, 'getCategoryBudgets')
      .mockResolvedValue(mockBudgets);

    // 2. Set up test transactions - total spend of 150 against a 100 limit
    const testTransactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: -100.0, category: 'Food', description: 'Grocery', status: 'completed' },
      { id: '2', date: '2026-05-02', amount: -50.0, category: 'Food', description: 'Takeout', status: 'completed' },
    ];

    // 3. Execute
    const result = await strategy.execute(testTransactions);

    // 4. Assert - overage amount ($50.00) and percentage (50.0%) are both reported
    expect(spy).toHaveBeenCalled();
    expect(result).toContain('Food');
    expect(result).toContain('$150.00');
    expect(result).toContain('$50.00');
    expect(result).toContain('50.0%');
  });

  it('should list the specific transactions contributing to categories that are over budget', async () => {
    // 1. Mock the BudgetService asynchronously
    const mockBudgets = { Food: 100, Rent: 1000 };
    const spy = vi
      .spyOn(BudgetService, 'getCategoryBudgets')
      .mockResolvedValue(mockBudgets);

    // 2. Set up test transactions - Food is over budget, Rent is not
    const testTransactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: -100.0, category: 'Food', description: 'Grocery', status: 'completed' },
      { id: '2', date: '2026-05-02', amount: -50.0, category: 'Food', description: 'Takeout', status: 'completed' },
      { id: '3', date: '2026-05-03', amount: -900.0, category: 'Rent', description: 'Apartment', status: 'completed' },
    ];

    // 3. Execute
    const result = await strategy.execute(testTransactions);

    // 4. Assert - the over-budget category's contributing transactions are listed individually,
    // while transactions from the under-budget category are not.
    expect(spy).toHaveBeenCalled();
    expect(result).toContain('Grocery');
    expect(result).toContain('Takeout');
    expect(result).not.toContain('Apartment');
  });

  it.todo('should handle scenarios where no categories are over budget');

  it.todo('should handle empty transaction list gracefully');
});