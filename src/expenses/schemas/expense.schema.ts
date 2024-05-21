import {
    IsString,
    IsNumber,
    IsDate,
    IsEnum,
    IsOptional,
    IsEmpty,
  } from 'class-validator';
  import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
  import { ExpenseCategory } from '../dto/expense.dto';
  import mongoose, { Document } from 'mongoose';
  import { User } from '../../auth/schemas/user.schema';
  
  @Schema({ timestamps: true })
  export class Expense extends Document {
    @Prop()
    @IsString()
    title: string;
  
    @Prop()
    @IsNumber()
    amount: number;
  
    @Prop({ default: new Date() })
    @IsOptional()
    date?: Date;
  
    @Prop()
    @IsString()
    @IsEnum(ExpenseCategory)
    category: string;
  
    @Prop()
    @IsOptional()
    @IsString()
    description?: string;
  
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    @IsEmpty()
    user: User;
  }
  export const ExpenseSchema = SchemaFactory.createForClass(Expense);
  