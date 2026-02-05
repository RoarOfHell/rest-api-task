import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({description: 'phone or email'})
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  @MinLength(4)
  password!: string;
}
