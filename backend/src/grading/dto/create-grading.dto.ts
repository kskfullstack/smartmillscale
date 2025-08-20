import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class CreateGradingDto {
  @ApiProperty({ description: 'ID Transaksi Timbang' })
  @IsString()
  @IsNotEmpty()
  transaksiTimbangId: string;

  @ApiProperty({ description: 'Total sample dalam kg', example: 100 })
  @IsNumber()
  @IsNotEmpty()
  totalSample: number;

  @ApiProperty({ description: 'Persentase buah matang (0-100)', example: 85.5 })
  @IsNumber()
  @Min(0)
  @Max(100)
  buahMatang: number;

  @ApiProperty({ description: 'Persentase buah mentah (0-100)', example: 10.2 })
  @IsNumber()
  @Min(0)
  @Max(100)
  buahMentah: number;

  @ApiProperty({ description: 'Persentase buah busuk (0-100)', example: 2.1 })
  @IsNumber()
  @Min(0)
  @Max(100)
  buahBusuk: number;

  @ApiProperty({ description: 'Persentase brondolan (0-100)', example: 1.5 })
  @IsNumber()
  @Min(0)
  @Max(100)
  brondolan: number;

  @ApiProperty({ description: 'Persentase sampah (0-100)', example: 0.5 })
  @IsNumber()
  @Min(0)
  @Max(100)
  sampah: number;

  @ApiProperty({ description: 'Persentase air (0-100)', example: 0.2 })
  @IsNumber()
  @Min(0)
  @Max(100)
  air: number;

  @ApiProperty({ description: 'Keterangan tambahan', required: false })
  @IsString()
  @IsOptional()
  keterangan?: string;

  @ApiProperty({ description: 'User ID yang input', required: false })
  @IsString()
  @IsOptional()
  userId?: string;
}