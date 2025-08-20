import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateSopirDto {
  @ApiProperty({ description: 'Nama sopir', example: 'Ahmad Supriyanto' })
  @IsString()
  @IsNotEmpty()
  nama: string;

  @ApiProperty({ description: 'Nomor KTP', example: '3201012345678901' })
  @IsString()
  @IsNotEmpty()
  noKtp: string;

  @ApiProperty({ description: 'Nomor SIM', example: 'SIM123456789', required: false })
  @IsString()
  @IsOptional()
  noSim?: string;

  @ApiProperty({ description: 'Telepon sopir', example: '08123456789', required: false })
  @IsString()
  @IsOptional()
  telepon?: string;

  @ApiProperty({ description: 'Alamat sopir', example: 'Jl. Merdeka No. 45', required: false })
  @IsString()
  @IsOptional()
  alamat?: string;

  @ApiProperty({ description: 'Status sopir', example: 'aktif', required: false })
  @IsString()
  @IsOptional()
  status?: string;
}