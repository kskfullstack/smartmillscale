import { Module } from '@nestjs/common';
import { TimbanganService } from './timbangan.service';
import { TimbanganController } from './timbangan.controller';

@Module({
  controllers: [TimbanganController],
  providers: [TimbanganService],
  exports: [TimbanganService],
})
export class TimbanganModule {}