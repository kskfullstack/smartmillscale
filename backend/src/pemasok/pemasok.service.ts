import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePemasokDto } from './dto/create-pemasok.dto';
import { UpdatePemasokDto } from './dto/update-pemasok.dto';

@Injectable()
export class PemasokService {
  constructor(private prisma: PrismaService) {}

  async create(createPemasokDto: CreatePemasokDto) {
    return this.prisma.pemasok.create({
      data: createPemasokDto,
    });
  }

  async findAll() {
    return this.prisma.pemasok.findMany({
      orderBy: { nama: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.pemasok.findUnique({
      where: { id },
      include: {
        transaksiTimbang: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findByKode(kode: string) {
    return this.prisma.pemasok.findUnique({
      where: { kode },
    });
  }

  async update(id: string, updatePemasokDto: UpdatePemasokDto) {
    return this.prisma.pemasok.update({
      where: { id },
      data: updatePemasokDto,
    });
  }

  async remove(id: string) {
    return this.prisma.pemasok.update({
      where: { id },
      data: { status: 'nonaktif' },
    });
  }

  async getActiveSuppliers() {
    return this.prisma.pemasok.findMany({
      where: { status: 'aktif' },
      orderBy: { nama: 'asc' },
    });
  }
}