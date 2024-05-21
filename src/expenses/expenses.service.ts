import { Injectable } from '@nestjs/common';
import { ExpenseRepository } from './expenses.repository';
import { Expense } from './schemas/expense.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { Query } from 'express-serve-static-core';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly expensesRepository: ExpenseRepository,
    @InjectModel(Expense.name)
    private expenseModel: Model<Expense>,
  ) {}

  private buildKeywordFilter(keyword?: string) {
    return keyword
      ? {
          title: {
            $regex: keyword,
            $options: 'i',
          },
        }
      : {};
  }

  async createExpense(createExpenseDto: any, user: User): Promise<Expense> {
    const data = Object.assign(createExpenseDto, { user: user._id });
    const expense = this.expensesRepository.create(data);
    return expense;
  }

  async findAll(query: Query): Promise<Expense[]> {
    const keyword = this.buildKeywordFilter(query.keyword as string);
    return this.expensesRepository.findAll({ ...keyword });
  }

  async getExpenseById(expenseId: string): Promise<Expense> {
    try {
      const expense = await this.expensesRepository.findOne({ _id: expenseId });
      return expense;
    } catch {}
  }

  async deleteExpense(expenseId: string): Promise<Expense> {
    try {
      const expense = await this.expensesRepository.delete({ _id: expenseId });
      return expense;
    } catch {}
  }

  async getExpensesByUserId(userId: string, query: Query): Promise<Expense[]> {
    const keyword = this.buildKeywordFilter(query.keyword as string);
    return this.expensesRepository.findAll({ user: userId, ...keyword });
  }

  async getSumExpensesByUserId(userId: string): Promise<number> {
    const expenses = await this.expensesRepository.findAll({ user: userId });
    return expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }

  async getTotalExpensesPerMonth(
    userId: string,
    year: number,
    month: number,
  ): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const expenses = await this.expensesRepository.findAll({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    });

    const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    return totalAmount;
  }

  async getTotalExpensesPerYear(
    userId: string,
    year: number,
  ): Promise<{ [month: number]: number }> {
    const totalExpensesByMonth: { [month: number]: number } = {};

    for (let month = 1; month <= 12; month++) {
      const totalAmount = await this.getTotalExpensesPerMonth(
        userId,
        year,
        month,
      );
      totalExpensesByMonth[month] = totalAmount;
    }

    return totalExpensesByMonth;
  }

  async updateExpense(
    expenseFilterQuery: Record<string, any>,
    updatedExpenseData: Partial<Expense>,
  ): Promise<Expense> {
    try {
      const updatedExpense = await this.expenseModel.findOneAndUpdate(
        expenseFilterQuery,
        updatedExpenseData,
        {
          new: true,
        },
      );

      if (!updatedExpense) {
        throw new Error('Expense not found');
      }
      return updatedExpense;
    } catch (error) {
      throw new Error(`Failed to update expense: ${error.message}`);
    }
  }

  async getExpensesByCategoryAndUser(
    userId: string,
    category: string,
    query: Query,
  ): Promise<Expense[]> {
    const keyword = this.buildKeywordFilter(query.keyword as string);
    return this.expensesRepository.findAll({
      user: userId,
      category,
      ...keyword,
    });
  }

  async getTotalAmountByCategory(): Promise<{ [category: string]: number }> {
    const expenses = await this.expensesRepository.findAll({});
    const categoryTotals: { [category: string]: number } = {};

    for (const expense of expenses) {
      const { category, amount } = expense;
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += amount;
    }

    return categoryTotals;
  }

  async getTotalAmountForCategory(category: string): Promise<number> {
    const expenses = await this.expensesRepository.findAll({ category });
    const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    return totalAmount;
  }

  async getTotalAmountForUserAndCategory(
    userId: string,
    category: string,
  ): Promise<number> {
    const expenses = await this.expensesRepository.findAll({
      user: userId,
      category,
    });
    const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    return totalAmount;
  }

  async getUserExpensesAggregate(category: string, userId: string) {
    const expenses = await this.expensesRepository.getUserExpensesAggregate(
      category,
      userId,
    );
    return expenses;
  }
}
