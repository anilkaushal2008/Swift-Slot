import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { CrmService } from './crm.service';
import { CreateCustomerDto } from './dtos/create-customer.dto';
import { UpdateCustomerDto } from './dtos/update-customer.dto';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('customers')
export class CrmController {
  constructor(private readonly crm: CrmService) {}

  @Get()
  findAll(@Query('search') search: string, @Req() req: any) {
    return this.crm.findAll(req.organizationId, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.crm.findOne(id, req.organizationId);
  }

  @Post()
  create(@Body() dto: CreateCustomerDto, @Req() req: any) {
    return this.crm.create(dto, req.organizationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto, @Req() req: any) {
    return this.crm.update(id, dto, req.organizationId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.crm.remove(id, req.organizationId);
  }
}
