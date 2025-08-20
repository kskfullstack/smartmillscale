import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransaksiTimbangDto } from './dto/create-transaksi-timbang.dto';
import { UpdateTransaksiTimbangDto } from './dto/update-transaksi-timbang.dto';

@Injectable()
export class TimbanganService {
  constructor(private prisma: PrismaService) {}

  async create(createTransaksiTimbangDto: CreateTransaksiTimbangDto) {
    const { beratBruto, beratTara, ...data } = createTransaksiTimbangDto;
    const beratNetto = beratBruto - beratTara;

    // Get company code from the active company profile
    const company = await this.prisma.company.findFirst({
      where: { isActive: true },
      select: { companyCode: true },
    });

    if (!company) {
      throw new Error('No active company profile found. Please create a company profile first.');
    }

    // Generate ticket number
    const nomorTiket = await this.generateTicketNumber(company.companyCode);

    return this.prisma.transaksiTimbang.create({
      data: {
        ...data,
        nomorTiket,
        companyCode: company.companyCode,
        beratBruto,
        beratTara,
        beratNetto,
        tanggal: data.tanggal ? new Date(data.tanggal) : new Date(),
      },
      include: {
        pemasok: true,
        sopir: true,
        kendaraan: true,
      },
    });
  }

  private async generateTicketNumber(companyCode: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const yearSuffix = currentYear.toString().slice(-2); // Get last 2 digits of year
    
    // Use transaction to ensure atomicity
    return await this.prisma.$transaction(async (prisma) => {
      // Find or create counter for current year
      let counter = await prisma.ticketCounter.findUnique({
        where: {
          companyCode_year: {
            companyCode,
            year: currentYear,
          },
        },
      });

      if (!counter) {
        counter = await prisma.ticketCounter.create({
          data: {
            companyCode,
            year: currentYear,
            lastNumber: 1,
          },
        });
      } else {
        counter = await prisma.ticketCounter.update({
          where: {
            companyCode_year: {
              companyCode,
              year: currentYear,
            },
          },
          data: {
            lastNumber: counter.lastNumber + 1,
          },
        });
      }

      // Format: companyCode-YY00001
      const paddedNumber = counter.lastNumber.toString().padStart(5, '0');
      return `${companyCode}-${yearSuffix}${paddedNumber}`;
    });
  }

  async findAll(page: number = 1, limit: number = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [data, total] = await Promise.all([
      this.prisma.transaksiTimbang.findMany({
        where,
        include: {
          pemasok: true,
          sopir: true,
          kendaraan: true,
          grading: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaksiTimbang.count({ where }),
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
    return this.prisma.transaksiTimbang.findUnique({
      where: { id },
      include: {
        pemasok: true,
        sopir: true,
        kendaraan: true,
        grading: true,
      },
    });
  }

  async findByNomorDo(nomorDo: string) {
    return this.prisma.transaksiTimbang.findUnique({
      where: { nomorDo },
      include: {
        pemasok: true,
        sopir: true,
        kendaraan: true,
        grading: true,
      },
    });
  }

  async findByNomorTiket(nomorTiket: string) {
    return this.prisma.transaksiTimbang.findUnique({
      where: { nomorTiket },
      include: {
        pemasok: true,
        sopir: true,
        kendaraan: true,
        grading: true,
      },
    });
  }

  async update(id: string, updateTransaksiTimbangDto: UpdateTransaksiTimbangDto) {
    const { beratBruto, beratTara, ...data } = updateTransaksiTimbangDto;
    
    let updateData: any = { ...data };
    
    if (beratBruto !== undefined && beratTara !== undefined) {
      updateData.beratBruto = beratBruto;
      updateData.beratTara = beratTara;
      updateData.beratNetto = beratBruto - beratTara;
    } else if (beratBruto !== undefined || beratTara !== undefined) {
      const existing = await this.prisma.transaksiTimbang.findUnique({
        where: { id },
      });
      
      const newBruto = beratBruto ?? existing.beratBruto;
      const newTara = beratTara ?? existing.beratTara;
      
      updateData.beratBruto = newBruto;
      updateData.beratTara = newTara;
      updateData.beratNetto = newBruto - newTara;
    }

    return this.prisma.transaksiTimbang.update({
      where: { id },
      data: updateData,
      include: {
        pemasok: true,
        sopir: true,
        kendaraan: true,
        grading: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.transaksiTimbang.update({
      where: { id },
      data: { status: 'batal' },
    });
  }

  async getDailyReport(date: string) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const transactions = await this.prisma.transaksiTimbang.findMany({
      where: {
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
        status: 'aktif',
      },
      include: {
        pemasok: true,
        sopir: true,
        kendaraan: true,
        grading: true,
      },
      orderBy: { tanggal: 'asc' },
    });

    const summary = {
      totalTransaksi: transactions.length,
      totalBeratBruto: transactions.reduce((sum, t) => sum + t.beratBruto, 0),
      totalBeratTara: transactions.reduce((sum, t) => sum + t.beratTara, 0),
      totalBeratNetto: transactions.reduce((sum, t) => sum + t.beratNetto, 0),
    };

    return {
      date,
      summary,
      transactions,
    };
  }

  async getMonthlyReport(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const transactions = await this.prisma.transaksiTimbang.findMany({
      where: {
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
        status: 'aktif',
      },
      include: {
        pemasok: true,
        grading: true,
      },
      orderBy: { tanggal: 'asc' },
    });

    const summary = {
      totalTransaksi: transactions.length,
      totalBeratNetto: transactions.reduce((sum, t) => sum + t.beratNetto, 0),
    };

    const bySupplier = transactions.reduce((acc, t) => {
      const pemasokId = t.pemasokId;
      if (!acc[pemasokId]) {
        acc[pemasokId] = {
          pemasok: t.pemasok,
          totalTransaksi: 0,
          totalBeratNetto: 0,
        };
      }
      acc[pemasokId].totalTransaksi++;
      acc[pemasokId].totalBeratNetto += t.beratNetto;
      return acc;
    }, {});

    return {
      year,
      month,
      summary,
      bySupplier: Object.values(bySupplier),
      transactions,
    };
  }
}