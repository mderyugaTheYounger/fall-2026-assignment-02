import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaxDeductionStrategy } from '../src/strategies/TaxDeductionStrategy.js';
import { TaxConfigService } from '../src/services/TaxConfigService.js';
import { Transaction } from '../src/models.js';

describe('TaxDeductionStrategy (Feature 4)', () => {
  let strategy: TaxDeductionStrategy;

  beforeEach(() => {
    strategy = new TaxDeductionStrategy();
    vi.restoreAllMocks();
  });

  it('should filter only the categories specified as deductible in the config', async () => {
  const mockConfig = {
    standardTaxRate: 0.10,
    deductibleCategories: ['Medical', 'Charity'],
  };

  vi.spyOn(TaxConfigService, 'getTaxConfig').mockResolvedValue(mockConfig);

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

  const result = await strategy.execute(testTransactions);

  expect(result).toContain('Donation');
  expect(result).toContain('Doctor Visit');
  expect(result).not.toContain('Grocery');
});

  it('should sum total eligible tax deductions correctly', async () => {
    const mockConfig = {
      standardTaxRate: 0.10,
      deductibleCategories: ['Medical', 'Charity'], 
    };

    vi.spyOn(TaxConfigService, 'getTaxConfig').mockResolvedValue(mockConfig);

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

    const result = await strategy.execute(testTransactions);

    expect(result).toContain('Deductions: $350.00');
});

  it.todo('should calculate estimated tax savings using standardTaxRate');

  it.todo(
    'should calculate estimated VAT/sales tax paid on non-deductible expense transactions',
  );

  it.todo(
    'should structure report to show both aggregates and itemized deductible transactions',
  );
});
