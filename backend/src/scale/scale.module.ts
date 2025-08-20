import { Module } from '@nestjs/common';
import { ScaleGateway } from './scale.gateway';
import { ScaleController } from './scale.controller';

@Module({
  providers: [ScaleGateway],
  controllers: [ScaleController],
  exports: [ScaleGateway],
})
export class ScaleModule {}