import { Module } from '@nestjs/common';
import { SopirService } from './sopir.service';
import { SopirController } from './sopir.controller';

@Module({
  controllers: [SopirController],
  providers: [SopirService],
  exports: [SopirService],
})
export class SopirModule {}