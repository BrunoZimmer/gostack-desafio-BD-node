import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactionsRepository = await this.find();

    const balance = transactionsRepository.reduce(
      (totalBalance: Balance, transaction: Transaction) => {
        if (transaction.type === 'income') {
          totalBalance.total += Number(transaction.value);
          totalBalance.income += Number(transaction.value);
          return totalBalance;
        }
        totalBalance.total -= Number(transaction.value);
        totalBalance.outcome += Number(transaction.value);
        return totalBalance;
      },
      { income: 0, outcome: 0, total: 0 },
    );

    return balance;
  }
}

export default TransactionsRepository;
