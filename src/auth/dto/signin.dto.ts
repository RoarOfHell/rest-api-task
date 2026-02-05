import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SigninDto {
  @ApiProperty({description: 'phone or email'})
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  password!: string;
}
