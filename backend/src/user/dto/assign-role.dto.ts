import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ example: 'clxxx...', description: 'Role ID' })
  @IsString()
  @IsNotEmpty()
  roleId: string;
}