import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: createUserDto.username },
          { email: createUserDto.email },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Extract roleId from createUserDto to avoid passing it to user creation
    const { roleId, ...userDataWithoutRole } = createUserDto;

    const user = await this.prisma.user.create({
      data: {
        ...userDataWithoutRole,
        password: hashedPassword,
      },
      include: {
        userRole: {
          include: {
            role: true,
          },
        },
      },
    });

    // Assign role if provided
    if (roleId) {
      try {
        // Create UserRole directly instead of using assignRole method
        await this.prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: roleId,
          },
        });
        
        // Fetch user with role after assignment
        const userWithRole = await this.prisma.user.findUnique({
          where: { id: user.id },
          include: {
            userRole: {
              include: {
                role: true,
              },
            },
          },
        });

        if (!userWithRole) {
          throw new NotFoundException('User not found after role assignment');
        }

        const { password, ...result } = userWithRole;
        return result;
      } catch (error) {
        // If role assignment fails, we still return the user without role
        console.error('Role assignment failed:', error);
        const { password, ...result } = user;
        return result;
      }
    }

    const { password, ...result } = user;
    return result;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: {
          userRole: {
            include: {
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count(),
    ]);

    const usersWithoutPassword = users.map(({ password, ...user }) => user);

    return {
      data: usersWithoutPassword,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRole: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...result } = user;
    return result;
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findByIdWithRoles(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        userRole: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        userRole: {
          include: {
            role: true,
          },
        },
      },
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  async remove(id: string) {
    const user = await this.findOne(id);

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'User deactivated successfully' };
  }

  async activate(id: string) {
    const user = await this.findOne(id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
      include: {
        userRole: {
          include: {
            role: true,
          },
        },
      },
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  async deactivate(id: string) {
    const user = await this.findOne(id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      include: {
        userRole: {
          include: {
            role: true,
          },
        },
      },
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  async assignRole(userId: string, roleId: string) {
    // With the unique constraint, we can use upsert to replace any existing role
    return this.prisma.userRole.upsert({
      where: {
        userId,
      },
      update: {
        roleId,
      },
      create: {
        userId,
        roleId,
      },
      include: {
        role: true,
      },
    });
  }

  async removeRole(userId: string, roleId: string) {
    const assignment = await this.prisma.userRole.findUnique({
      where: {
        userId,
      },
    });

    if (!assignment || assignment.roleId !== roleId) {
      throw new NotFoundException('Role assignment not found');
    }

    await this.prisma.userRole.delete({
      where: { userId },
    });

    return { message: 'Role removed successfully' };
  }
}