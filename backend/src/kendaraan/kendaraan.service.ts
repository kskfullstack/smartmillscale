import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKendaraanDto } from './dto/create-kendaraan.dto';
import { UpdateKendaraanDto } from './dto/update-kendaraan.dto';

@Injectable()
export class KendaraanService {
  constructor(private prisma: PrismaService) {}

  async create(createKendaraanDto: CreateKendaraanDto) {
    return this.prisma.kendaraan.create({
      data: createKendaraanDto,
    });
  }

  async findAll() {
    return this.prisma.kendaraan.findMany({
      orderBy: { nopol: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.kendaraan.findUnique({
      where: { id },
      include: {
        transaksiTimbang: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findByNopol(nopol: string) {
    return this.prisma.kendaraan.findUnique({
      where: { nopol },
    });
  }

  async update(id: string, updateKendaraanDto: UpdateKendaraanDto) {
    return this.prisma.kendaraan.update({
      where: { id },
      data: updateKendaraanDto,
    });
  }

  async remove(id: string) {
    return this.prisma.kendaraan.update({
      where: { id },
      data: { status: 'nonaktif' },
    });
  }

  async getActiveVehicles() {
    return this.prisma.kendaraan.findMany({
      where: { status: 'aktif' },
      orderBy: { nopol: 'asc' },
    });
  }
}