import {
    IsString,
    IsNumber,
    IsDate,
    IsEnum,
    IsOptional,
    ValidateIf,
    IsEmpty,
  } from 'class-validator';
  import { ApiProperty, PartialType } from '@nestjs/swagger';
  
  export enum ExpenseCategory {
    Food = 'Food',
    Bills = 'Bills',
    Travel = 'Travel',
    Entertainment = 'Entertainment',
    Transportation = 'Transportation',
    Other = 'Other',
  }
  
  export class CreateExpenseDto {
    @IsString()
    title: string;
  
    @IsNumber()
    amount: number;
  
    @IsOptional()
    date?: Date;
  
    @IsString()
    @IsEnum(ExpenseCategory)
    category: string;
  
    @IsOptional()
    @IsString()
    @ValidateIf((dto) => dto.category === 'Other')
    description?: string;
  
    @IsOptional()
    @IsString()
    @IsEmpty()
    user?: string;
  }
  
  export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}
  