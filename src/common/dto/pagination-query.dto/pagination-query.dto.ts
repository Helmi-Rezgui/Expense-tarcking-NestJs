import {
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsPositive()
  limit: number;
  @IsOptional()
  @IsPositive()
  offset: number;
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsIn(['date', 'amount', 'category'])
  sortBy: string;
  @IsOptional()
  @IsISO8601({ strict: true })
  @Length(10, 10)
  startDate: string;
  @IsOptional()
  @IsISO8601({ strict: true })
  @Length(10, 10)
  endDate: string;
}
