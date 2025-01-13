import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';

class Company {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;
}

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name khong duoc de trong' })
  name: string;

  @IsEmail({}, { message: 'Email khong dung dinh dang' })
  @IsNotEmpty({ message: 'Email khong duoc de trong' })
  email: string;

  @IsNotEmpty({ message: 'Pasword khong duoc de trong' })
  password: string;

  @IsNotEmpty({ message: 'Age khong duoc de trong' })
  age: string;

  @IsNotEmpty({ message: 'Gender khong duoc de trong' })
  gender: string;

  @IsNotEmpty({ message: 'Address khong duoc de trong' })
  address: string;

  @IsNotEmpty({ message: 'Role khong duoc de trong' })
  @IsMongoId({ message: 'Role có định dạng là mongoId' })
  role: mongoose.Schema.Types.ObjectId;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;
}
export class RegisterUserDto {
  @IsNotEmpty({ message: 'Name khong duoc de trong' })
  name: string;

  @IsEmail({}, { message: 'Email khong dung dinh dang' })
  @IsNotEmpty({ message: 'Email khong duoc de trong' })
  email: string;

  @IsNotEmpty({ message: 'Pasword khong duoc de trong' })
  password: string;

  @IsNotEmpty({ message: 'Age khong duoc de trong' })
  age: string;

  @IsNotEmpty({ message: 'Gender khong duoc de trong' })
  gender: string;

  @IsNotEmpty({ message: 'Address khong duoc de trong' })
  address: string;
}
export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'nguyenhao@gmail.com', description: 'username' })
  readonly username: string;
  
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '123456',
    description: 'password'
  })
  readonly password: string;
}
