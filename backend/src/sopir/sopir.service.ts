import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSopirDto } from './dto/create-sopir.dto';
import { UpdateSopirDto } from './dto/update-sopir.dto';

@Injectable()
export class SopirService {
  constructor(private prisma: PrismaService) {}

  async create(createSopirDto: CreateSopirDto) {
    return this.prisma.sopir.create({
      data: createSopirDto,
    });
  }

  async findAll() {
    return this.prisma.sopir.findMany({
      orderBy: { nama: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.sopir.findUnique({
      where: { id },
      include: {
        transaksiTimbang: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findByKtp(noKtp: string) {
    return this.prisma.sopir.findUnique({
      where: { noKtp },
    });
  }

  async update(id: string, updateSopirDto: UpdateSopirDto) {
    return this.prisma.sopir.update({
      where: { id },
      data: updateSopirDto,
    });
  }

  async remove(id: string) {
    return this.prisma.sopir.update({
      where: { id },
      data: { status: 'nonaktif' },
    });
  }

  async getActiveDrivers() {
    return this.prisma.sopir.findMany({
      where: { status: 'aktif' },
      orderBy: { nama: 'asc' },
    });
  }
}