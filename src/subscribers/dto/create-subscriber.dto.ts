import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateSubscriberDto {
  @IsNotEmpty({ message: 'name không được để trống' })
  name: string;
  
  @IsNotEmpty({ message: 'email không được để trống' })
  @IsEmail({}, { message: 'Email khong dung dinh dang' })
  email: string;

  @IsNotEmpty({ message: 'skills không được để trống' })
  @IsArray({ message: 'skills định dạng mảng' })
  @IsString({ each: true, message: 'skills định dạng string' })
  skills: string[];
}
