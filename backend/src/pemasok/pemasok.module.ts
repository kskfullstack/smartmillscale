import { Module } from '@nestjs/common';
import { PemasokService } from './pemasok.service';
import { PemasokController } from './pemasok.controller';

@Module({
  controllers: [PemasokController],
  providers: [PemasokService],
  exports: [PemasokService],
})
export class PemasokModule {}