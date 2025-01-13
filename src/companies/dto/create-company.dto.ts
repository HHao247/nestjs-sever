import { IsNotEmpty } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty({ message: 'name note empty' })
  name: string;

  @IsNotEmpty({ message: 'address note empty' })
  address: string;

  @IsNotEmpty({ message: 'description note empty' })
  description: string;

  @IsNotEmpty({ message: 'logo note empty' })
  logo: string;
}
