import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaxDeductionStrategy } from '../src/strategies/TaxDeductionStrategy.js';
import { TaxConfigService } from '../src/services/TaxConfigService.js';
import { Transaction } from '../src/models.js';

describe('TaxDeductionStrategy (Feature 4)', () => {
  let strategy: TaxDeductionStrategy;

  const mockConfig = {
    standardTaxRate: 0.10,
    deductibleCategories: ['Medical', 'Charity'],
  };

  const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-01',
        amount: -200.00,
        category: 'Charity',
        description: 'Donation',
        status: 'completed',
      },
      {
        id: '2',
        date: '2026-05-02',
        amount: -100.00,
        category: 'Food',
        description: 'Grocery',
        status: 'completed',
      },
      {
        id: '3',
        date: '2026-05-03',
        amount: -150.00,
        category: 'Medical',
        description: 'Doctor Visit',
        status: 'completed',
      },
    ];

  beforeEach(() => {
    strategy = new TaxDeductionStrategy();
    vi.restoreAllMocks();

    vi.spyOn(TaxConfigService, 'getTaxConfig')
    .mockResolvedValue(mockConfig);
  });

  it('should filter only the categories specified as deductible in the config', async () => {
  const result = await strategy.execute(testTransactions);

  expect(result).toContain('Donation');
  expect(result).toContain('Doctor Visit');
  expect(result).not.toContain('Grocery');
});

  it('should sum total eligible tax deductions correctly', async () => {
    const result = await strategy.execute(testTransactions);

    expect(result).toContain('Deductions: $350.00');
});

  it('should calculate estimated tax savings using standardTaxRate', async () => {
    const result = await strategy.execute(testTransactions);

    expect(result).toContain('Savings: $35.00');
  });

  it('should calculate estimated VAT/sales tax paid on non-deductible expense transactions', async () => {
    const result = await strategy.execute(testTransactions);

    expect(result).toContain('VAT: $10.00')
  });

  it('should structure report to show both aggregates and itemized deductible transactions', async () => {
    const result = await strategy.execute(testTransactions);

    expect(result).toContain('Donation: $200.00');
    expect(result).toContain('Doctor Visit: $150.00');

    expect(result).toContain('Deductions: $350.00');
    expect(result).toContain('Savings: $35.00');
    expect(result).toContain('VAT: $10.00')
  });
});
