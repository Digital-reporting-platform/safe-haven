import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      message: 'SafeHaven API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      apiVersion: 'v1',
      endpoints: {
        docs: '/api/v1/docs',
        auth: '/api/v1/auth',
        reports: '/api/v1/reports',
      },
    };
  }

  @Get('health')
  getHealthCheck() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
