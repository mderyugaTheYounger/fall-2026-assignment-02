import { Transaction } from '../models.js';
import { ExchangeRateService } from '../services/ExchangeRateService.js';
import { AuditStrategy } from './AuditStrategy.js';

export class MultiCurrencyStrategy implements AuditStrategy {
  public readonly name = 'Multi-Currency Auditor';
  public readonly description =
    'Converts and aggregates transactions in a foreign currency';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    // TODO: Feature 5 - Implement this strategy.
    // 1. Call ExchangeRateService.getExchangeRates() asynchronously.
    const rates = await ExchangeRateService.getExchangeRates();
    // 2. Identify the target currency from `customParam` (default to 'EUR' if invalid/not provided).
    if(customParam == null){
      customParam = 'EUR';
    }
    // 3. Look up the exchange rate for the target currency (throw an error if not found in rates).
    if(!rates.rates.hasOwnProperty(customParam)){
      throw new Error(`Invalid Currency: ${customParam}`)
    }
    let r = rates.rates[customParam];
    console.log(r);
    // 4. Convert all transaction amounts to the target currency.
    let t: float[] = [];
    for(let element of transactions){
      console.log(element);
      t.push(element.amount * r);
    }
    // 5. Calculate total income, total expenses, and net balance in BOTH USD and target currency.
    let expenses: float = 0, income: float = 0;
    for(let element of t){
      if(element<0){
        expenses -= element;
      }
      else{
        income += element;
      }
    }
    let balance: float = income - expenses;
    // 6. Format and return a text-based audit report detailing conversion metrics, conversion rate used, and transaction summaries in both currencies.
    return(
    `AUDIT REPRORT
    EXPENSES: ${expenses.toFixed(2)} ${customParam}
    INCOME: ${income.toFixed(2)} ${customParam}
    ----------------
    BALANCE: ${balance.toFixed(2)} ${customParam}`
    )
  }
}
