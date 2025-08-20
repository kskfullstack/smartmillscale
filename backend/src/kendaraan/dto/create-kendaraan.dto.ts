import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateKendaraanDto {
  @ApiProperty({ description: 'Nomor polisi kendaraan', example: 'B 1234 XYZ' })
  @IsString()
  @IsNotEmpty()
  nopol: string;

  @ApiProperty({ description: 'Jenis kendaraan', example: 'truk' })
  @IsString()
  @IsNotEmpty()
  jenis: string;

  @ApiProperty({ description: 'Kapasitas dalam ton', example: 10.5, required: false })
  @IsNumber()
  @IsOptional()
  kapasitas?: number;

  @ApiProperty({ description: 'Merk kendaraan', example: 'Mitsubishi', required: false })
  @IsString()
  @IsOptional()
  merk?: string;

  @ApiProperty({ description: 'Tahun kendaraan', example: 2020, required: false })
  @IsNumber()
  @IsOptional()
  tahun?: number;

  @ApiProperty({ description: 'Status kendaraan', example: 'aktif', required: false })
  @IsString()
  @IsOptional()
  status?: string;
}