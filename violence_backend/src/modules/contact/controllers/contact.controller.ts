import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Delete,
  Put,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ContactService } from '../services/contact.service';
import { CreateContactDto } from '../dto/create-contact.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ContactStatus } from '@prisma/client';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit contact form' })
  @ApiResponse({ status: 201, description: 'Contact submission created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createContact(@Body() createContactDto: CreateContactDto, @Req() req?: any) {
    return this.contactService.createContact(createContactDto, req);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Get all contact submissions (Admin only)' })
  @ApiResponse({ status: 200, description: 'Contact submissions retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ContactStatus })
  async getAllContacts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: ContactStatus,
  ) {
    return this.contactService.getAllContacts(status, page, limit);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Get contact statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Contact statistics retrieved successfully' })
  async getContactStats() {
    return this.contactService.getContactStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Get contact submission by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Contact submission ID' })
  @ApiResponse({ status: 200, description: 'Contact submission retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Contact submission not found' })
  async getContactById(@Param('id') id: string) {
    return this.contactService.getContactById(id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Update contact submission status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Contact submission ID' })
  @ApiResponse({ status: 200, description: 'Contact status updated successfully' })
  async updateContactStatus(
    @Param('id') id: string,
    @Body('status') status: ContactStatus,
  ) {
    return this.contactService.updateContactStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete contact submission (Admin only)' })
  @ApiParam({ name: 'id', description: 'Contact submission ID' })
  @ApiResponse({ status: 200, description: 'Contact submission deleted successfully' })
  async deleteContact(@Param('id') id: string) {
    await this.contactService.deleteContact(id);
    return { message: 'Contact submission deleted successfully' };
  }
}
