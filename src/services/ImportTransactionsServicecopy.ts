import {
  getRepository,
  In,
  TransactionRepository,
  getCustomRepository,
} from 'typeorm';

import csvParse from 'csv-parse';
import fs from 'fs';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from './CreateTransactionService';
import { resolveConfig } from 'prettier';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    // const transactionsRepository = getCustomRepository(TransactionsRepository);
    // const categoriesRepository = getRepository(Category);
    const createTransaction = new CreateTransactionService();

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];
    const transactionsFinal: Transaction[] = [];

    const contactsReadStream = fs.createReadStream(filePath);
    const parsers = csvParse({ from_line: 2 });
    const parseCSV = contactsReadStream.pipe(parsers);

    parseCSV.on('data', row => {
      const [title, type, value, category] = row.map((cell: string) =>
        cell.trim(),
      );

      transactions.push({ title, type, value, category });
      categories.push(category);
    });
    await new Promise(resolve => parseCSV.on('end', resolve));

    transactions.map(async (resolve, { title, value, type, category }) => {
      const transactionF = await createTransaction.execute({
        title,
        value,
        type,
        category,
      });
      await transactionsFinal.push(transactionF);
    });
    return transactionsFinal;
    }
  }
}

export default ImportTransactionsService;
