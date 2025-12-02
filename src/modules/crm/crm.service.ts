import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { CreateCustomerDto } from './dtos/create-customer.dto';
import { UpdateCustomerDto } from './dtos/update-customer.dto';

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, search?: string) {
    const where: any = { organizationId };
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const customers = await this.prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { appointments: true } },
      },
    });
    
    return {
      success: true,
      data: customers.map((c: any) => ({
        ...c,
        appointmentCount: c._count.appointments,
      })),
    };
  }

  async findOne(id: string, organizationId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, organizationId },
      include: {
        appointments: {
          take: 10,
          orderBy: { startTime: 'desc' },
        },
      },
    });

    if (!customer) throw new NotFoundException('Customer not found');

    return { success: true, data: customer };
  }

  async create(dto: CreateCustomerDto, organizationId: string) {
    const existing = await this.prisma.customer.findFirst({
      where: { email: dto.email, organizationId },
    });

    if (existing) throw new ConflictException('Email already exists');

    const customer = await this.prisma.customer.create({
      data: { ...dto, organizationId },
    });

    return { success: true, data: customer };
  }

  async update(id: string, dto: UpdateCustomerDto, organizationId: string) {
    const existing = await this.prisma.customer.findFirst({
      where: { id, organizationId },
    });

    if (!existing) throw new NotFoundException('Customer not found');

    const customer = await this.prisma.customer.update({
      where: { id },
      data: dto,
    });

    return { success: true, data: customer };
  }

  async remove(id: string, organizationId: string) {
    const existing = await this.prisma.customer.findFirst({
      where: { id, organizationId },
    });

    if (!existing) throw new NotFoundException('Customer not found');

    await this.prisma.customer.delete({ where: { id } });

    return { success: true, message: 'Deleted' };
  }
}
