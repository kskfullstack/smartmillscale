import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'operator_timbangan', description: 'Role name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Operator for weighing operations', description: 'Role description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    example: ['timbangan:read', 'timbangan:write'], 
    description: 'Array of permissions',
    required: false,
    type: [String]
  })
  @IsArray()
  @IsOptional()
  permissions?: string[];
}