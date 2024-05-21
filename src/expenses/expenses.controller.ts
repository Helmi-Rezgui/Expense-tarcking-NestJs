import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Expense } from './schemas/expense.schema';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/expense.dto';
import { AuthGuard } from '@nestjs/passport';
import { Query as ExpressQuery } from 'express-serve-static-core';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expenseService: ExpensesService) {}

  //Add new expense
  @UseGuards(AuthGuard())
  @Post('add')
  async addExpense(
    @Body() createExpenseDto: CreateExpenseDto,
    @Req() req,
  ): Promise<Expense> {
    const createdExpense = await this.expenseService.createExpense(
      createExpenseDto,
      req.user,
    );
    return createdExpense;
  }
  //Get all expenses
  @Get()
  async getExpenses(@Query() query: ExpressQuery): Promise<Expense[]> {
    return this.expenseService.findAll(query);
  }

  //Getting one epxense by its id
  @UseGuards(AuthGuard())
  @Get(':expenseId')
  async getExpense(@Param('expenseId') expenseId: string): Promise<Expense> {
    return this.expenseService.getExpenseById(expenseId);
  }

  //Delete expense
  @UseGuards(AuthGuard())
  @Delete(':expenseId')
  async deleteExpense(@Param('expenseId') expenseId: string): Promise<Expense> {
    return this.expenseService.deleteExpense(expenseId);
  }

  //Getting the user expenses
  @UseGuards(AuthGuard())
  @Get('my-expenses/:userId')
  async getExpensesByUserId(
    @Param('userId') userId: string,
    @Query('keyword') keyword: string,
  ): Promise<Expense[]> {
    return this.expenseService.getExpensesByUserId(userId, { keyword });
  }

  //Getting the total expenses
  @UseGuards(AuthGuard())
  @Get('sum/:userId')
  async getSumExpensesByUserId(
    @Param('userId') userId: string,
  ): Promise<number> {
    return this.expenseService.getSumExpensesByUserId(userId);
  }

  //Getting the total expenses for current month
  @UseGuards(AuthGuard())
  @Get('current-month/:userId')
  async getTotalExpensesForCurrentMonth(
    @Param('userId') userId: string,
  ): Promise<number> {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    return this.expenseService.getTotalExpensesPerMonth(
      userId,
      currentYear,
      currentMonth,
    );
  }

  //Getting for each month of the year
  @UseGuards(AuthGuard())
  @Get('year/:userId')
  async getTotalExpensesPerYear(
    @Param('userId') userId: string,
  ): Promise<{ [month: number]: number }> {
    const today = new Date();
    const currentYear = today.getFullYear();

    return this.expenseService.getTotalExpensesPerYear(userId, currentYear);
  }

  //Update Expense
  @UseGuards(AuthGuard())
  @Patch(':expenseId')
  async updateExpense(
    @Param('expenseId') expenseId: string,
    @Body() updatedExpenseData: Partial<Expense>,
  ): Promise<Expense> {
    const updatedExpense = await this.expenseService.updateExpense(
      { _id: expenseId },
      updatedExpenseData,
    );
    return updatedExpense;
  }

  //get expenses by category + amount spent on it
  @UseGuards(AuthGuard())
  @Get('categories/:category/users/:userId')
  async getExpensesByCategoryAndUser(
    @Param('category') category: string,
    @Param('userId') userId: string,
    @Query('keyword') keyword: string,
  ): Promise<any> {
    const expenses = await this.expenseService.getExpensesByUserId(userId, {
      keyword,
    });

    const totalAmount = await this.expenseService.getUserExpensesAggregate(
      category,
      userId,
    );

    return { expenses, totalAmount };
  }
}
