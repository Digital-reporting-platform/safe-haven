import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupportService } from '../services/support.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('support')
@Controller('support')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupportController {
  constructor(private supportService: SupportService) {}

  @Post('requests')
  @ApiOperation({ summary: 'Create support request' })
  createRequest(@Request() req: any, @Body() dto: { serviceProviderId: string; description: string }) {
    return this.supportService.createRequest(req.user.sub, dto);
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Get my support requests' })
  getMyRequests(@Request() req: any) {
    return this.supportService.getUserRequests(req.user.sub);
  }

  @Get('provider-requests')
  @ApiOperation({ summary: 'Get provider support requests' })
  getProviderRequests(@Request() req: any) {
    return this.supportService.getProviderRequests(req.user.sub);
  }

  @Put('requests/:id/status')
  @ApiOperation({ summary: 'Update request status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.supportService.updateRequestStatus(id, status);
  }
}
