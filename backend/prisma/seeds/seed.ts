import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create default roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'System Administrator with full access',
      permissions: JSON.stringify([
        'timbangan:read',
        'timbangan:write',
        'timbangan:delete',
        'grading:read',
        'grading:write',
        'grading:delete',
        'users:read',
        'users:write',
        'users:delete',
        'roles:read',
        'roles:write',
        'roles:delete',
        'reports:read',
      ]),
    },
  });

  const operatorTimbanganRole = await prisma.role.upsert({
    where: { name: 'operator_timbangan' },
    update: {},
    create: {
      name: 'operator_timbangan',
      description: 'Weighing Scale Operator',
      permissions: JSON.stringify([
        'timbangan:read',
        'timbangan:write',
        'grading:read',
      ]),
    },
  });

  const operatorGradingRole = await prisma.role.upsert({
    where: { name: 'operator_grading' },
    update: {},
    create: {
      name: 'operator_grading',
      description: 'Grading Quality Control Operator',
      permissions: JSON.stringify([
        'grading:read',
        'grading:write',
        'timbangan:read',
      ]),
    },
  });

  const supervisorRole = await prisma.role.upsert({
    where: { name: 'supervisor' },
    update: {},
    create: {
      name: 'supervisor',
      description: 'Operations Supervisor',
      permissions: JSON.stringify([
        'timbangan:read',
        'timbangan:write',
        'grading:read',
        'grading:write',
        'reports:read',
      ]),
    },
  });

  console.log('Created roles:', {
    adminRole: adminRole.name,
    operatorTimbanganRole: operatorTimbanganRole.name,
    operatorGradingRole: operatorGradingRole.name,
    supervisorRole: supervisorRole.name,
  });

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@pks.com',
      password: hashedPassword,
      fullName: 'System Administrator',
      isActive: true,
    },
  });

  // Assign admin role to admin user
  await prisma.userRole.upsert({
    where: {
      userId: adminUser.id,
    },
    update: {
      roleId: adminRole.id,
    },
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log('Created admin user:', {
    username: adminUser.username,
    email: adminUser.email,
    fullName: adminUser.fullName,
  });

  console.log('Database seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });