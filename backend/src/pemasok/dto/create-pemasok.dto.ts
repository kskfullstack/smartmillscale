import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePemasokDto {
  @ApiProperty({ description: 'Kode pemasok', example: 'PMS001' })
  @IsString()
  @IsNotEmpty()
  kode: string;

  @ApiProperty({ description: 'Nama pemasok', example: 'CV. Sumber Makmur' })
  @IsString()
  @IsNotEmpty()
  nama: string;

  @ApiProperty({ description: 'Alamat pemasok', example: 'Jl. Raya No. 123', required: false })
  @IsString()
  @IsOptional()
  alamat?: string;

  @ApiProperty({ description: 'Telepon pemasok', example: '08123456789', required: false })
  @IsString()
  @IsOptional()
  telepon?: string;

  @ApiProperty({ description: 'Email pemasok', example: 'info@sumbermakmur.com', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Nama kontak person', example: 'Budi Santoso', required: false })
  @IsString()
  @IsOptional()
  kontak?: string;

  @ApiProperty({ description: 'Status pemasok', example: 'aktif', required: false })
  @IsString()
  @IsOptional()
  status?: string;
}