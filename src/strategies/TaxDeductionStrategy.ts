import { isContext } from 'vm';
import { Transaction } from '../models.js';
import { TaxConfigService } from '../services/TaxConfigService.js';
import { AuditStrategy } from './AuditStrategy.js';

export class TaxDeductionStrategy implements AuditStrategy {
  public readonly name = 'Tax & Deductions Auditor';
  public readonly description =
    'Identifies eligible tax-deductible expenses and estimates savings';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    // Get current tax configuration
    const config = await TaxConfigService.getTaxConfig();

    // Find eligible deductible expenses
    const deductibleTransactions = transactions.filter(
      (transaction) =>
        transaction.amount < 0 &&
      config.deductibleCategories.includes(transaction.category),
    );

    // Calculate total deductions
    const totalDeductions = deductibleTransactions.reduce(
      (total, transaction) => total + Math.abs(transaction.amount),
      0,
    );

    // Estimate tax savings
    const estimatedTaxSavings = totalDeductions * config.standardTaxRate;

    // Find non-deductible expenses
    const nonDeductibleTransactions = transactions.filter(
      (transaction) =>
        transaction.amount < 0 &&
        !config.deductibleCategories.includes(transaction.category),
    )

    // Format deductible transactions for report
    const itemizedDeductions = deductibleTransactions
      .map(
        (transaction) =>
          `${transaction.description}: $${Math.abs(transaction.amount).toFixed(2)}`,
      )
      .join('\n');

    // Calculate non-deductible expense total
    const nonDeductibleTotal = nonDeductibleTransactions.reduce(
      (total, transaction) => total + Math.abs(transaction.amount),
      0,
    );

    // Estimate VAT on non-deductible expenses
    const estimatedVat = nonDeductibleTotal * config.standardTaxRate;

    // Return formatted audit report
    return `Tax & Deductions Audit
        
    Eligible Deductions: 
    ${itemizedDeductions}

    Deductions: $${totalDeductions.toFixed(2)}
    Savings: $${estimatedTaxSavings.toFixed(2)}
    VAT: $${estimatedVat.toFixed(2)}`;
  }
}
