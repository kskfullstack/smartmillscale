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
import { PemasokService } from './pemasok.service';
import { CreatePemasokDto } from './dto/create-pemasok.dto';
import { UpdatePemasokDto } from './dto/update-pemasok.dto';

@ApiTags('pemasok')
@Controller('pemasok')
// Temporarily disabled for setup
// @UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PemasokController {
  constructor(private readonly pemasokService: PemasokService) {}

  @Post()
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Create new pemasok' })
  @ApiResponse({ status: 201, description: 'Pemasok created successfully' })
  create(@Body() createPemasokDto: CreatePemasokDto) {
    return this.pemasokService.create(createPemasokDto);
  }

  @Get()
  @Roles('admin', 'supervisor', 'operator_timbangan', 'operator_grading')
  @ApiOperation({ summary: 'Get all pemasok' })
  @ApiResponse({ status: 200, description: 'List of all pemasok' })
  findAll() {
    return this.pemasokService.findAll();
  }

  @Get('active')
  @Roles('admin', 'supervisor', 'operator_timbangan', 'operator_grading')
  @ApiOperation({ summary: 'Get active pemasok only' })
  @ApiResponse({ status: 200, description: 'List of active pemasok' })
  getActiveSuppliers() {
    return this.pemasokService.getActiveSuppliers();
  }

  @Get(':id')
  @Roles('admin', 'supervisor', 'operator_timbangan', 'operator_grading')
  @ApiOperation({ summary: 'Get pemasok by ID' })
  @ApiParam({ name: 'id', description: 'Pemasok ID' })
  @ApiResponse({ status: 200, description: 'Pemasok details' })
  findOne(@Param('id') id: string) {
    return this.pemasokService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Update pemasok' })
  @ApiParam({ name: 'id', description: 'Pemasok ID' })
  @ApiResponse({ status: 200, description: 'Pemasok updated successfully' })
  update(@Param('id') id: string, @Body() updatePemasokDto: UpdatePemasokDto) {
    return this.pemasokService.update(id, updatePemasokDto);
  }

  @Delete(':id')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Soft delete pemasok (set to inactive)' })
  @ApiParam({ name: 'id', description: 'Pemasok ID' })
  @ApiResponse({ status: 200, description: 'Pemasok deactivated successfully' })
  remove(@Param('id') id: string) {
    return this.pemasokService.remove(id);
  }
}