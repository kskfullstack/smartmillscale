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
import { SopirService } from './sopir.service';
import { CreateSopirDto } from './dto/create-sopir.dto';
import { UpdateSopirDto } from './dto/update-sopir.dto';

@ApiTags('sopir')
@Controller('sopir')
// Temporarily disabled for setup
// @UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SopirController {
  constructor(private readonly sopirService: SopirService) {}

  @Post()
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Create new sopir' })
  @ApiResponse({ status: 201, description: 'Sopir created successfully' })
  create(@Body() createSopirDto: CreateSopirDto) {
    return this.sopirService.create(createSopirDto);
  }

  @Get()
  @Roles('admin', 'supervisor', 'operator_timbangan', 'operator_grading')
  @ApiOperation({ summary: 'Get all sopir' })
  @ApiResponse({ status: 200, description: 'List of all sopir' })
  findAll() {
    return this.sopirService.findAll();
  }

  @Get('active')
  @Roles('admin', 'supervisor', 'operator_timbangan', 'operator_grading')
  @ApiOperation({ summary: 'Get active sopir only' })
  @ApiResponse({ status: 200, description: 'List of active sopir' })
  getActiveDrivers() {
    return this.sopirService.getActiveDrivers();
  }

  @Get(':id')
  @Roles('admin', 'supervisor', 'operator_timbangan', 'operator_grading')
  @ApiOperation({ summary: 'Get sopir by ID' })
  @ApiParam({ name: 'id', description: 'Sopir ID' })
  @ApiResponse({ status: 200, description: 'Sopir details' })
  findOne(@Param('id') id: string) {
    return this.sopirService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Update sopir' })
  @ApiParam({ name: 'id', description: 'Sopir ID' })
  @ApiResponse({ status: 200, description: 'Sopir updated successfully' })
  update(@Param('id') id: string, @Body() updateSopirDto: UpdateSopirDto) {
    return this.sopirService.update(id, updateSopirDto);
  }

  @Delete(':id')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Soft delete sopir (set to inactive)' })
  @ApiParam({ name: 'id', description: 'Sopir ID' })
  @ApiResponse({ status: 200, description: 'Sopir deactivated successfully' })
  remove(@Param('id') id: string) {
    return this.sopirService.remove(id);
  }
}