import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    const existingRole = await this.prisma.role.findUnique({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException('Role name already exists');
    }

    const permissionsJson = createRoleDto.permissions 
      ? JSON.stringify(createRoleDto.permissions) 
      : null;

    return this.prisma.role.create({
      data: {
        ...createRoleDto,
        permissions: permissionsJson,
      },
      include: {
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll() {
    const roles = await this.prisma.role.findMany({
      include: {
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return roles.map(role => ({
      ...role,
      permissions: role.permissions ? JSON.parse(role.permissions) : [],
    }));
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return {
      ...role,
      permissions: role.permissions ? JSON.parse(role.permissions) : [],
    };
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.findOne(id);

    const permissionsJson = updateRoleDto.permissions 
      ? JSON.stringify(updateRoleDto.permissions) 
      : role.permissions;

    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: {
        ...updateRoleDto,
        permissions: permissionsJson,
      },
      include: {
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    return {
      ...updatedRole,
      permissions: updatedRole.permissions ? JSON.parse(updatedRole.permissions) : [],
    };
  }

  async remove(id: string) {
    const role = await this.findOne(id);

    // Check if role is assigned to any users
    const usersWithRole = await this.prisma.userRole.count({
      where: { roleId: id },
    });

    if (usersWithRole > 0) {
      throw new ConflictException('Cannot delete role that is assigned to users');
    }

    await this.prisma.role.delete({
      where: { id },
    });

    return { message: 'Role deleted successfully' };
  }

  async findByName(name: string) {
    const role = await this.prisma.role.findUnique({
      where: { name },
    });

    if (!role) {
      return null;
    }

    return {
      ...role,
      permissions: role.permissions ? JSON.parse(role.permissions) : [],
    };
  }
}