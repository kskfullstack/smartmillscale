import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { GradingService } from './grading.service';
import { CreateGradingDto } from './dto/create-grading.dto';
import { UpdateGradingDto } from './dto/update-grading.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('grading')
@Controller('grading')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GradingController {
  constructor(private readonly gradingService: GradingService) {}

  @Post()
  @Roles('admin', 'operator_grading', 'supervisor')
  @ApiOperation({ summary: 'Create new grading assessment' })
  @ApiResponse({ status: 201, description: 'Grading created successfully' })
  create(@Body() createGradingDto: CreateGradingDto, @Request() req) {
    return this.gradingService.create({
      ...createGradingDto,
      userId: req.user.id,
    });
  }

  @Get()
  @Roles('admin', 'operator_grading', 'operator_timbangan', 'supervisor')
  @ApiOperation({ summary: 'Get all grading assessments with pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'List of grading assessments' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.gradingService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('reports')
  @Roles('admin', 'supervisor', 'operator_grading')
  @ApiOperation({ summary: 'Get grading report by date range' })
  @ApiQuery({ name: 'startDate', description: 'Start date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'endDate', description: 'End date in YYYY-MM-DD format' })
  @ApiResponse({ status: 200, description: 'Grading report' })
  getGradingReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.gradingService.getGradingReport(startDate, endDate);
  }

  @Get('transaksi/:transaksiTimbangId')
  @Roles('admin', 'operator_grading', 'operator_timbangan', 'supervisor')
  @ApiOperation({ summary: 'Get grading by transaction ID' })
  @ApiParam({ name: 'transaksiTimbangId', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Grading details' })
  findByTransaksiTimbang(@Param('transaksiTimbangId') transaksiTimbangId: string) {
    return this.gradingService.findByTransaksiTimbang(transaksiTimbangId);
  }

  @Get(':id')
  @Roles('admin', 'operator_grading', 'operator_timbangan', 'supervisor')
  @ApiOperation({ summary: 'Get grading by ID' })
  @ApiParam({ name: 'id', description: 'Grading ID' })
  @ApiResponse({ status: 200, description: 'Grading details' })
  findOne(@Param('id') id: string) {
    return this.gradingService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'operator_grading', 'supervisor')
  @ApiOperation({ summary: 'Update grading assessment' })
  @ApiParam({ name: 'id', description: 'Grading ID' })
  @ApiResponse({ status: 200, description: 'Grading updated successfully' })
  update(@Param('id') id: string, @Body() updateGradingDto: UpdateGradingDto, @Request() req) {
    return this.gradingService.update(id, {
      ...updateGradingDto,
      userId: req.user.id,
    });
  }

  @Delete(':id')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Delete grading assessment' })
  @ApiParam({ name: 'id', description: 'Grading ID' })
  @ApiResponse({ status: 200, description: 'Grading deleted successfully' })
  remove(@Param('id') id: string) {
    return this.gradingService.remove(id);
  }
}