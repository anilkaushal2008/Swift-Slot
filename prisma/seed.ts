import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean database
  await prisma.appointment.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Create demo organization
  const org = await prisma.organization.create({
    data: {
      name: 'Demo Salon',
      slug: 'demo-salon',
      email: 'demo@swiftslot.com',
      timezone: 'America/New_York',
    },
  });
  console.log('✓ Created organization:', org.slug);

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      organizationId: org.id,
    },
  });
  console.log('✓ Created admin: admin@demo.com / Admin123!');

  // Create staff user
  const staffPassword = await bcrypt.hash('Staff123!', 12);
  const staff = await prisma.user.create({
    data: {
      email: 'staff@demo.com',
      passwordHash: staffPassword,
      firstName: 'Staff',
      lastName: 'Member',
      role: 'STAFF',
      organizationId: org.id,
    },
  });
  console.log('✓ Created staff: staff@demo.com / Staff123!');

  // Create services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Haircut',
        description: 'Professional haircut and styling',
        duration: 30,
        price: 35,
        color: '#FF6B6B',
        organizationId: org.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Hair Coloring',
        description: 'Full hair coloring service',
        duration: 120,
        price: 120,
        color: '#4ECDC4',
        organizationId: org.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Manicure',
        description: 'Classic manicure',
        duration: 45,
        price: 25,
        color: '#95E1D3',
        organizationId: org.id,
      },
    }),
  ]);
  console.log(`✓ Created ${services.length} services`);

  // Create sample customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Smith',
        phone: '+1234567890',
        tags: ['vip', 'regular'],
        organizationId: org.id,
      },
    }),
    prisma.customer.create({
      data: {
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '+1987654321',
        tags: ['new'],
        organizationId: org.id,
      },
    }),
  ]);
  console.log(`✓ Created ${customers.length} customers`);

  console.log('\n🎉 Seeding complete!\n');
  console.log('Login credentials:');
  console.log('  Admin: admin@demo.com / Admin123!');
  console.log('  Staff: staff@demo.com / Staff123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
