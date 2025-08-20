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
import { TimbanganService } from './timbangan.service';
import { CreateTransaksiTimbangDto } from './dto/create-transaksi-timbang.dto';
import { UpdateTransaksiTimbangDto } from './dto/update-transaksi-timbang.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('timbangan')
@Controller('timbangan')
// Temporarily disabled for testing
// @UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TimbanganController {
  constructor(private readonly timbanganService: TimbanganService) {}

  @Post()
  // Temporarily disabled for testing
  // @Roles('admin', 'operator_timbangan', 'supervisor')
  @ApiOperation({ summary: 'Create new weighing transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  async create(@Body() createTransaksiTimbangDto: CreateTransaksiTimbangDto, @Request() req) {
    try {
      const result = await this.timbanganService.create({
        ...createTransaksiTimbangDto,
        userId: req.user?.id || null,
      });
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @Roles('admin', 'operator_timbangan', 'operator_grading', 'supervisor')
  @ApiOperation({ summary: 'Get all weighing transactions with pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, description: 'Transaction status' })
  @ApiResponse({ status: 200, description: 'List of transactions' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.timbanganService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      status,
    );
  }

  @Get('reports/daily/:date')
  @Roles('admin', 'supervisor', 'operator_timbangan')
  @ApiOperation({ summary: 'Get daily weighing report' })
  @ApiParam({ name: 'date', description: 'Date in YYYY-MM-DD format' })
  @ApiResponse({ status: 200, description: 'Daily report' })
  getDailyReport(@Param('date') date: string) {
    return this.timbanganService.getDailyReport(date);
  }

  @Get('reports/monthly/:year/:month')
  @Roles('admin', 'supervisor', 'operator_timbangan')
  @ApiOperation({ summary: 'Get monthly weighing report' })
  @ApiParam({ name: 'year', description: 'Year' })
  @ApiParam({ name: 'month', description: 'Month' })
  @ApiResponse({ status: 200, description: 'Monthly report' })
  getMonthlyReport(@Param('year') year: string, @Param('month') month: string) {
    return this.timbanganService.getMonthlyReport(parseInt(year), parseInt(month));
  }

  @Get('do/:nomorDo')
  @Roles('admin', 'operator_timbangan', 'operator_grading', 'supervisor')
  @ApiOperation({ summary: 'Get transaction by DO number' })
  @ApiParam({ name: 'nomorDo', description: 'DO Number' })
  @ApiResponse({ status: 200, description: 'Transaction details' })
  findByNomorDo(@Param('nomorDo') nomorDo: string) {
    return this.timbanganService.findByNomorDo(nomorDo);
  }

  @Get('ticket/:nomorTiket')
  @Roles('admin', 'operator_timbangan', 'operator_grading', 'supervisor')
  @ApiOperation({ summary: 'Get transaction by ticket number' })
  @ApiParam({ name: 'nomorTiket', description: 'Ticket Number' })
  @ApiResponse({ status: 200, description: 'Transaction details' })
  findByNomorTiket(@Param('nomorTiket') nomorTiket: string) {
    return this.timbanganService.findByNomorTiket(nomorTiket);
  }

  @Get(':id')
  @Roles('admin', 'operator_timbangan', 'operator_grading', 'supervisor')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction details' })
  findOne(@Param('id') id: string) {
    return this.timbanganService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'operator_timbangan', 'supervisor')
  @ApiOperation({ summary: 'Update weighing transaction' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully' })
  update(@Param('id') id: string, @Body() updateTransaksiTimbangDto: UpdateTransaksiTimbangDto, @Request() req) {
    return this.timbanganService.update(id, {
      ...updateTransaksiTimbangDto,
      userId: req.user.id,
    });
  }

  @Delete(':id')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Cancel weighing transaction' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction cancelled successfully' })
  remove(@Param('id') id: string) {
    return this.timbanganService.remove(id);
  }
}