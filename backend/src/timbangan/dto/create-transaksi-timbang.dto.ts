import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CreateTransaksiTimbangDto {
  @ApiProperty({ description: 'Nomor DO/SPB', example: 'DO001-2024' })
  @IsString()
  @IsNotEmpty()
  nomorDo: string;

  @ApiProperty({ description: 'Tanggal transaksi', example: '2024-01-15T10:30:00Z', required: false })
  @IsDateString()
  @IsOptional()
  tanggal?: string;

  @ApiProperty({ description: 'ID Pemasok' })
  @IsString()
  @IsNotEmpty()
  pemasokId: string;

  @ApiProperty({ description: 'ID Sopir' })
  @IsString()
  @IsNotEmpty()
  sopirId: string;

  @ApiProperty({ description: 'ID Kendaraan' })
  @IsString()
  @IsNotEmpty()
  kendaraanId: string;

  @ApiProperty({ description: 'Jenis barang/produk', example: 'TBS' })
  @IsString()
  @IsNotEmpty()
  jenisBarang: string;

  @ApiProperty({ description: 'Berat bruto dalam kg', example: 15000 })
  @IsNumber()
  @IsNotEmpty()
  beratBruto: number;

  @ApiProperty({ description: 'Berat tara dalam kg', example: 5000 })
  @IsNumber()
  @IsNotEmpty()
  beratTara: number;

  @ApiProperty({ description: 'Keterangan tambahan', required: false })
  @IsString()
  @IsOptional()
  keterangan?: string;

  @ApiProperty({ description: 'User ID yang input', required: false })
  @IsString()
  @IsOptional()
  userId?: string;
}