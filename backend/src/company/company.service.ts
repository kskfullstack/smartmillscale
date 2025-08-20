import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto) {
    const data = {
      ...createCompanyDto,
      established: createCompanyDto.established 
        ? new Date(createCompanyDto.established) 
        : undefined,
    };

    return this.prisma.company.create({
      data,
    });
  }

  async findAll(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    
    const [data, total] = await Promise.all([
      this.prisma.company.findMany({
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.company.count(),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async findFirst() {
    return this.prisma.company.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.findOne(id);

    const data = {
      ...updateCompanyDto,
      established: updateCompanyDto.established 
        ? new Date(updateCompanyDto.established) 
        : undefined,
    };

    return this.prisma.company.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const company = await this.findOne(id);

    return this.prisma.company.delete({
      where: { id },
    });
  }

  async activate(id: string) {
    const company = await this.findOne(id);

    return this.prisma.company.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivate(id: string) {
    const company = await this.findOne(id);

    return this.prisma.company.update({
      where: { id },
      data: { isActive: false },
    });
  }
}