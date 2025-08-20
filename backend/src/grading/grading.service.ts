import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGradingDto } from './dto/create-grading.dto';
import { UpdateGradingDto } from './dto/update-grading.dto';

@Injectable()
export class GradingService {
  constructor(private prisma: PrismaService) {}

  private calculateGradingValue(gradingData: Partial<CreateGradingDto>): string {
    const { buahMatang, buahMentah, buahBusuk, brondolan, sampah, air } = gradingData;
    
    // Standar grading berdasarkan persentase buah matang
    if (buahMatang >= 90) return 'A';
    if (buahMatang >= 80) return 'B';
    if (buahMatang >= 70) return 'C';
    return 'D';
  }

  private validatePercentages(gradingData: Partial<CreateGradingDto>): void {
    const { buahMatang, buahMentah, buahBusuk, brondolan, sampah, air } = gradingData;
    const total = (buahMatang || 0) + (buahMentah || 0) + (buahBusuk || 0) + (brondolan || 0) + (sampah || 0) + (air || 0);
    
    if (Math.abs(total - 100) > 0.01) { // Allow small floating point errors
      throw new BadRequestException('Total persentase harus sama dengan 100%');
    }
  }

  async create(createGradingDto: CreateGradingDto) {
    this.validatePercentages(createGradingDto);
    
    // Check if transaction exists and doesn't already have grading
    const existingTransaction = await this.prisma.transaksiTimbang.findUnique({
      where: { id: createGradingDto.transaksiTimbangId },
      include: { grading: true },
    });

    if (!existingTransaction) {
      throw new BadRequestException('Transaksi timbang tidak ditemukan');
    }

    if (existingTransaction.grading) {
      throw new BadRequestException('Transaksi ini sudah memiliki data grading');
    }

    // Get company code from the active company profile
    const company = await this.prisma.company.findFirst({
      where: { isActive: true },
      select: { companyCode: true },
    });

    if (!company) {
      throw new BadRequestException('No active company profile found. Please create a company profile first.');
    }

    const nilaiGrading = this.calculateGradingValue(createGradingDto);

    return this.prisma.grading.create({
      data: {
        ...createGradingDto,
        companyCode: company.companyCode,
        nilaiGrading,
      },
      include: {
        transaksiTimbang: {
          include: {
            pemasok: true,
            sopir: true,
            kendaraan: true,
          },
        },
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.grading.findMany({
        include: {
          transaksiTimbang: {
            include: {
              pemasok: true,
              sopir: true,
              kendaraan: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.grading.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.grading.findUnique({
      where: { id },
      include: {
        transaksiTimbang: {
          include: {
            pemasok: true,
            sopir: true,
            kendaraan: true,
          },
        },
      },
    });
  }

  async findByTransaksiTimbang(transaksiTimbangId: string) {
    return this.prisma.grading.findUnique({
      where: { transaksiTimbangId },
      include: {
        transaksiTimbang: {
          include: {
            pemasok: true,
            sopir: true,
            kendaraan: true,
          },
        },
      },
    });
  }

  async update(id: string, updateGradingDto: UpdateGradingDto) {
    let updateData: any = { ...updateGradingDto };
    
    if (Object.keys(updateGradingDto).some(key => 
      ['buahMatang', 'buahMentah', 'buahBusuk', 'brondolan', 'sampah', 'air'].includes(key)
    )) {
      const existing = await this.prisma.grading.findUnique({ where: { id } });
      const updatedData = { ...existing, ...updateGradingDto };
      this.validatePercentages(updatedData);
      updateData.nilaiGrading = this.calculateGradingValue(updatedData);
    }

    return this.prisma.grading.update({
      where: { id },
      data: updateData,
      include: {
        transaksiTimbang: {
          include: {
            pemasok: true,
            sopir: true,
            kendaraan: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.grading.delete({
      where: { id },
    });
  }

  async getGradingReport(startDate: string, endDate: string) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const gradings = await this.prisma.grading.findMany({
      where: {
        transaksiTimbang: {
          tanggal: {
            gte: start,
            lte: end,
          },
          status: 'aktif',
        },
      },
      include: {
        transaksiTimbang: {
          include: {
            pemasok: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const summary = {
      totalGrading: gradings.length,
      averageBuahMatang: gradings.reduce((sum, g) => sum + g.buahMatang, 0) / gradings.length || 0,
      averageBuahMentah: gradings.reduce((sum, g) => sum + g.buahMentah, 0) / gradings.length || 0,
      averageBuahBusuk: gradings.reduce((sum, g) => sum + g.buahBusuk, 0) / gradings.length || 0,
      gradingDistribution: {
        A: gradings.filter(g => g.nilaiGrading === 'A').length,
        B: gradings.filter(g => g.nilaiGrading === 'B').length,
        C: gradings.filter(g => g.nilaiGrading === 'C').length,
        D: gradings.filter(g => g.nilaiGrading === 'D').length,
      },
    };

    const bySupplier = gradings.reduce((acc, g) => {
      const pemasokId = g.transaksiTimbang.pemasokId;
      if (!acc[pemasokId]) {
        acc[pemasokId] = {
          pemasok: g.transaksiTimbang.pemasok,
          totalGrading: 0,
          averageBuahMatang: 0,
          gradingDistribution: { A: 0, B: 0, C: 0, D: 0 },
          gradings: [],
        };
      }
      acc[pemasokId].totalGrading++;
      acc[pemasokId].gradings.push(g);
      acc[pemasokId].gradingDistribution[g.nilaiGrading]++;
      return acc;
    }, {});

    // Calculate averages for each supplier
    Object.values(bySupplier).forEach((supplier: any) => {
      supplier.averageBuahMatang = supplier.gradings.reduce((sum, g) => sum + g.buahMatang, 0) / supplier.gradings.length;
    });

    return {
      startDate,
      endDate,
      summary,
      bySupplier: Object.values(bySupplier),
      gradings,
    };
  }
}