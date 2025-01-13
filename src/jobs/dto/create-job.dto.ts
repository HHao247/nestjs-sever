import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested
} from 'class-validator';
import mongoose from 'mongoose';

class Company {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  logo: string;

  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;
}

export class CreateJobDto {
  @IsNotEmpty({ message: 'Name khong duoc de trong' })
  name: string;

  @IsNotEmpty({ message: 'location khong duoc de trong' })
  location: string;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;

  @IsArray({ message: 'skills co dinh dang array' })
  @IsString({ each: true, message: 'skills dinh dang string' })
  @IsNotEmpty({ message: 'Skills khong duoc de trong' })
  skills: string[];

  @IsNotEmpty({ message: 'salary khong duoc de trong' })
  salary: number;

  @IsNotEmpty({ message: 'quantity khong duoc de trong' })
  quantity: number;

  @IsNotEmpty({ message: 'Level khong duoc de trong' })
  level: string;

  @IsNotEmpty({ message: 'Description khong duoc de trong' })
  description: string;

  @IsNotEmpty({ message: 'StartDate khong duoc de trong' })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'startDate khong dung dinh dang kieu Date' })
  startDate: Date;

  @IsNotEmpty({ message: 'endDate khong duoc de trong' })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'endDate khong dung dinh dang kieu Date' })
  // @Type(() => Date)
  endDate: Date;

  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive: boolean;
}
