import { PartialType } from '@nestjs/swagger';
import { CreatePemasokDto } from './create-pemasok.dto';

export class UpdatePemasokDto extends PartialType(CreatePemasokDto) {}