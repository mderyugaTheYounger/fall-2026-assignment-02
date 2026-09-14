import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MultiCurrencyStrategy } from '../src/strategies/MultiCurrencyStrategy.js';
import { ExchangeRateService } from '../src/services/ExchangeRateService.js';
import { Transaction } from '../src/models.js';

describe('MultiCurrencyStrategy (Feature 5)', () => {
  let strategy: MultiCurrencyStrategy;

  beforeEach(() => {
    strategy = new MultiCurrencyStrategy();
    vi.restoreAllMocks();
  });

  // Example of how to write and mock in your tests:
  //
  // it('should convert amounts and sum values in target currency', async () => {
  //   const mockRates = { base: 'USD', rates: { EUR: 0.90 } };
  //   const spy = vi.spyOn(ExchangeRateService, 'getExchangeRates').mockResolvedValue(mockRates);
  //
  //   const testTransactions: Transaction[] = [
  //     { id: '1', date: '2026-05-01', amount: 100.00, category: 'Salary', description: 'Gig', status: 'completed' },
  //     { id: '2', date: '2026-05-02', amount: -50.00, category: 'Food', description: 'Grocery', status: 'completed' },
  //   ];
  //
  //   const result = await strategy.execute(testTransactions, 'EUR');
  //
  //   expect(spy).toHaveBeenCalled();
  //   expect(result).toContain('90.00 EUR'); // 100 * 0.90
  //   expect(result).toContain('-45.00 EUR'); // -50 * 0.90
  //   expect(result).toContain('Balance: 45.00 EUR');
  // });

  it('should parse exchange rates and use customParam target currency', async () => {
    const mockRates = { base: 'USD', rates: { EUR: 0.90 } };
    const spy = vi.spyOn(ExchangeRateService, 'getExchangeRates').mockResolvedValue(mockRates);

    const testInput: Transaction[] = [
      { id: '1', date: '2026-09-14', amount: 80.00, category: 'Expense', description: 'Test_Description', status: 'completed'},
    ];

    const result = await strategy.execute(testInput, 'EUR');
    console.log(result);
    expect(spy).toHaveBeenCalled();
    expect(result).toContain('72.00 EUR'); // 80 * 0.9, target currency EUR
  });

  it('should default to EUR conversion if currency param is missing or invalid', async () => {
    const mockRates = { base: 'USD', rates: { EUR: 0.90 } };
    const spy = vi.spyOn(ExchangeRateService, 'getExchangeRates').mockResolvedValue(mockRates);

    const testInput: Transaction[] = [
      { id: '1', date: '2026-09-14', amount: 90.00, category: 'Expense', description: 'Test_Description', status: 'completed'}
    ];
    const result = await strategy.execute(testInput);
    console.log(result);
    expect(spy).toHaveBeenCalled();
    expect(result).toContain('81.00 EUR'); // 90 * 0.9, target currency EUR as no input currency
  });

  it('should throw an error if the target currency does not exist in exchange rates', async () => {
    const mockRates = { base: 'USD', rates: { EUR: 0.90 } };
    const spy = vi.spyOn(ExchangeRateService, 'getExchangeRates').mockResolvedValue(mockRates);

    const testInput: Transaction[] = [
      { id: '1', date: '2026-09-14', amount: 90.00, category: 'Expense', description: 'Test_Description', status: 'completed'}
    ];
    await expect(strategy.execute(testInput, 'RUB')).rejects.toThrow('Invalid Currency: RUB');

  });

  it.todo(
    'should accurately convert individual transaction amounts to the target currency',
  );

  it.todo(
    'should calculate and display totals (income, expense, net balance) in both USD and target currency',
  );
});
