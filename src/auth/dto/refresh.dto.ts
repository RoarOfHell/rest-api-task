import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({description: 'refresh user token'})
  @IsString()
  refresh_token!: string;
}
