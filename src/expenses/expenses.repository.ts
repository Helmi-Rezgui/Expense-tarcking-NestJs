import { Injectable } from '@nestjs/common';
import { Expense } from './schemas/expense.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';

@Injectable()
export class ExpenseRepository {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
  ) {}

  async findOne(expenseFilterQuery: FilterQuery<Expense>): Promise<Expense> {
    return this.expenseModel.findOne(expenseFilterQuery);
  }

  async findAll(expenseFilterQuery: FilterQuery<Expense>): Promise<Expense[]> {
    return this.expenseModel.find(expenseFilterQuery);
  }

  async findOneAndUpdate(
    expenseFilterQuery: FilterQuery<Expense>,
    expense: Partial<Expense>,
  ): Promise<Expense> {
    return this.expenseModel.findOneAndUpdate(expenseFilterQuery, expense, {
      new: true,
    });
  }

  async create(expense: Expense): Promise<Expense> {
    const newExpense = new this.expenseModel(expense);
    return newExpense.save();
  }

  async delete(expenseFilterQuery: FilterQuery<Expense>): Promise<Expense> {
    return this.expenseModel.findOneAndDelete(expenseFilterQuery);
  }

  async update(
    expenseFilterQuery: FilterQuery<Expense>,
    expense: Partial<Expense>,
  ): Promise<Expense> {
    return this.expenseModel.findOneAndUpdate(expenseFilterQuery, expense, {
      new: true,
    });
  }

  async findByCategory(category: string): Promise<Expense[]> {
    return this.expenseModel.find({ category }).exec();
  }

  async getUserExpensesAggregate(
    category: string,
    userId: string,
  ): Promise<any> {
    return this.expenseModel.aggregate([
      {
        $match: {
          category: category,
          user: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
    ]);
  }
}
