import { Module } from '@nestjs/common';
import { KendaraanService } from './kendaraan.service';
import { KendaraanController } from './kendaraan.controller';

@Module({
  controllers: [KendaraanController],
  providers: [KendaraanService],
  exports: [KendaraanService],
})
export class KendaraanModule {}