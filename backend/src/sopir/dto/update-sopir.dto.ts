import { PartialType } from '@nestjs/swagger';
import { CreateSopirDto } from './create-sopir.dto';

export class UpdateSopirDto extends PartialType(CreateSopirDto) {}