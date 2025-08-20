import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ScaleGateway, ScaleData } from './scale.gateway';

@ApiTags('scale')
@Controller('scale')
export class ScaleController {
  constructor(private readonly scaleGateway: ScaleGateway) {}

  @Post('simulate-weight')
  @ApiOperation({ summary: 'Simulate scale weight for testing' })
  @ApiResponse({ status: 200, description: 'Weight simulated successfully' })
  simulateWeight(@Body() body: { weight: number }) {
    this.scaleGateway.setWeight(body.weight);
    return { 
      message: 'Weight simulated successfully', 
      weight: body.weight 
    };
  }

  @Post('broadcast-data')
  @ApiOperation({ summary: 'Broadcast scale data to all connected clients' })
  @ApiResponse({ status: 200, description: 'Scale data broadcasted successfully' })
  broadcastScaleData(@Body() scaleData: ScaleData) {
    this.scaleGateway.broadcastScaleData(scaleData);
    return { 
      message: 'Scale data broadcasted successfully',
      data: scaleData 
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Get scale connection status' })
  @ApiResponse({ status: 200, description: 'Scale status retrieved successfully' })
  getScaleStatus() {
    return {
      connected: true,
      message: 'Scale gateway is running',
      timestamp: new Date(),
    };
  }
}