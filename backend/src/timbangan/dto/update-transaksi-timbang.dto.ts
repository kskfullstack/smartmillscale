import { PartialType } from '@nestjs/swagger';
import { CreateTransaksiTimbangDto } from './create-transaksi-timbang.dto';

export class UpdateTransaksiTimbangDto extends PartialType(CreateTransaksiTimbangDto) {}