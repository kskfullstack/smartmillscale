import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { KendaraanService } from './kendaraan.service';
import { CreateKendaraanDto } from './dto/create-kendaraan.dto';
import { UpdateKendaraanDto } from './dto/update-kendaraan.dto';

@ApiTags('kendaraan')
@Controller('kendaraan')
// Temporarily disabled for setup
// @UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class KendaraanController {
  constructor(private readonly kendaraanService: KendaraanService) {}

  @Post()
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Create new kendaraan' })
  @ApiResponse({ status: 201, description: 'Kendaraan created successfully' })
  create(@Body() createKendaraanDto: CreateKendaraanDto) {
    return this.kendaraanService.create(createKendaraanDto);
  }

  @Get()
  @Roles('admin', 'supervisor', 'operator_timbangan', 'operator_grading')
  @ApiOperation({ summary: 'Get all kendaraan' })
  @ApiResponse({ status: 200, description: 'List of all kendaraan' })
  findAll() {
    return this.kendaraanService.findAll();
  }

  @Get('active')
  @Roles('admin', 'supervisor', 'operator_timbangan', 'operator_grading')
  @ApiOperation({ summary: 'Get active kendaraan only' })
  @ApiResponse({ status: 200, description: 'List of active kendaraan' })
  getActiveVehicles() {
    return this.kendaraanService.getActiveVehicles();
  }

  @Get(':id')
  @Roles('admin', 'supervisor', 'operator_timbangan', 'operator_grading')
  @ApiOperation({ summary: 'Get kendaraan by ID' })
  @ApiParam({ name: 'id', description: 'Kendaraan ID' })
  @ApiResponse({ status: 200, description: 'Kendaraan details' })
  findOne(@Param('id') id: string) {
    return this.kendaraanService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Update kendaraan' })
  @ApiParam({ name: 'id', description: 'Kendaraan ID' })
  @ApiResponse({ status: 200, description: 'Kendaraan updated successfully' })
  update(@Param('id') id: string, @Body() updateKendaraanDto: UpdateKendaraanDto) {
    return this.kendaraanService.update(id, updateKendaraanDto);
  }

  @Delete(':id')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Soft delete kendaraan (set to inactive)' })
  @ApiParam({ name: 'id', description: 'Kendaraan ID' })
  @ApiResponse({ status: 200, description: 'Kendaraan deactivated successfully' })
  remove(@Param('id') id: string) {
    return this.kendaraanService.remove(id);
  }
}