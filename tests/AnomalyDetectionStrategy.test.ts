import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnomalyDetectionStrategy } from '../src/strategies/AnomalyDetectionStrategy.js';
import { AnomalyRulesService } from '../src/services/AnomalyRulesService.js';
import { AnomalyRules, Transaction } from '../src/models.js';

describe('AnomalyDetectionStrategy (Feature 2)', () => {
  let strategy: AnomalyDetectionStrategy;

  beforeEach(() => {
    strategy = new AnomalyDetectionStrategy();
    vi.restoreAllMocks();
  });

  // Example of how to write and mock in your tests:
  //
  // it('should detect outlier transactions exceeding threshold', async () => {
  //   const mockRules = { maxTransactionAmount: 500.00, flaggedStatuses: ['flagged'] };
  //   const spy = vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue(mockRules);
  //
  //   const testTransactions: Transaction[] = [
  //     { id: '1', date: '2026-05-01', amount: -600.00, category: 'Shopping', description: 'Laptop', status: 'completed' }, // Outlier
  //     { id: '2', date: '2026-05-02', amount: -100.00, category: 'Food', description: 'Grocery', status: 'completed' }, // Normal
  //   ];
  //
  //   const result = await strategy.execute(testTransactions);
  //
  //   expect(spy).toHaveBeenCalled();
  //   expect(result).toContain('Laptop');
  //   expect(result).toContain('Outlier');
  // });

  it('should detect outlier transactions exceeding the configured max amount limit', async () => {
    const mockRules: AnomalyRules = {
        maxTransactionAmount: 500.00,
        flaggedStatuses: ['flagged'],
    };

    const spy = vi
        .spyOn(AnomalyRulesService, 'getRules')
        .mockResolvedValue(mockRules);

    const testTransactions: Transaction[] = [
        {
            id: '1',
            date: '2026-05-01',
            amount: -600.00,
            category: 'Shopping',
            description: 'Laptop',
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
    ];

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain('Laptop');
    expect(result).toContain('OUTLIER TRANSACTIONS');
});

  it('should identify duplicate transactions sharing identical date, amount, category, and description', async () => {
    const mockRules: AnomalyRules = {
        maxTransactionAmount: 1000.00,
        flaggedStatuses: ['flagged'],
    };

    const spy = vi
        .spyOn(AnomalyRulesService, 'getRules')
        .mockResolvedValue(mockRules);

    const testTransactions: Transaction[] = [
        {
            id: '1',
            date: '2026-05-01',
            amount: -100.00,
            category: 'Food',
            description: 'Grocery',
            status: 'completed',
        },
        {
            id: '2',
            date: '2026-05-01',
            amount: -100.00,
            category: 'Food',
            description: 'Grocery',
            status: 'completed',
        },
        {
            id: '3',
            date: '2026-05-02',
            amount: -100.00,
            category: 'Food',
            description: 'Grocery',
            status: 'completed',
        },
    ];

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain('DUPLICATE TRANSACTION SETS');
    expect(result).toContain('"id":"1"');
    expect(result).toContain('"id":"2"');
    expect(result).toContain('Set 1');
});

  it('should flag transactions matching standard flagged statuses in the rules', async () => {
    const mockRules: AnomalyRules = {
        maxTransactionAmount: 1000.00,
        flaggedStatuses: ['flagged'],
    };

    const spy = vi
        .spyOn(AnomalyRulesService, 'getRules')
        .mockResolvedValue(mockRules);

    const testTransactions: Transaction[] = [
        {
            id: '1',
            date: '2026-05-01',
            amount: -100.00,
            category: 'Food',
            description: 'Grocery',
            status: 'flagged',
        },
        {
            id: '2',
            date: '2026-05-02',
            amount: -50.00,
            category: 'Shopping',
            description: 'Clothes',
            status: 'completed',
        },
    ];

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain('FLAGGED STATUS TRANSACTIONS');
    expect(result).toContain('"id":"1"');
});

  it('should calculate correct transaction anomaly rates and total flagged valuation', async () => {
    const mockRules: AnomalyRules = {
        maxTransactionAmount: 500.00,
        flaggedStatuses: ['flagged'],
    };

    const spy = vi
        .spyOn(AnomalyRulesService, 'getRules')
        .mockResolvedValue(mockRules);

    const testTransactions: Transaction[] = [
        {
            id: '1',
            date: '2026-05-01',
            amount: -600.00,
            category: 'Shopping',
            description: 'Laptop',
            status: 'completed',
        },
        {
            id: '2',
            date: '2026-05-02',
            amount: -100.00,
            category: 'Food',
            description: 'Grocery',
            status: 'flagged',
        },
    ];

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain('Anomaly Percentage: 100.00%');
    expect(result).toContain('Total Flagged Value: 700.00');
});

 it('should output a clean, readable text audit report detailing warnings', async () => {
    const testTransactions: Transaction[] = [
        {
            id: '1',
            date: '2026-05-01',
            amount: -600.00,
            category: 'Shopping',
            description: 'Laptop',
            status: 'completed',
        },
        {
            id: '2',
            date: '2026-05-02',
            amount: -100.00,
            category: 'Food',
            description: 'Grocery',
            status: 'flagged',
        },
    ];

    const result = await strategy.execute(testTransactions);

    expect(result).toContain('Anomaly Report:');
    expect(result).toContain('OUTLIER TRANSACTIONS:');
    expect(result).toContain('FLAGGED STATUS TRANSACTIONS:');
    expect(result).toContain('SUMMARY:');
    expect(result).toContain('Total Transactions: 2');
   expect(result).toContain('Anomaly Percentage: 50.00%');
});
});
