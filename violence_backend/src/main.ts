import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Railway assigns PORT dynamically, default to 3000 for local dev
  const port = parseInt(process.env.PORT || '3000', 10);
  const apiPrefix = (process.env.API_PREFIX || '/api').replace(/\/$/, '');
  const apiVersion = process.env.API_VERSION
    ? `/${process.env.API_VERSION.replace(/^\/+|\/+$/g, '')}`
    : '';
  const globalPrefix = `${apiPrefix}${apiVersion}`;

  app.setGlobalPrefix(globalPrefix);
  
  app.use(helmet());
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://pleasant-expression.vercel.app',
  'https://pleaseant-expression.vercel.app',
  'https://pleasing-expression-production-237e.up.railway.app',
  process.env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin));

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });
  
  const config = new DocumentBuilder()
    .setTitle('SafeHaven API')
    .setDescription('Violence, Abuse, and Bullying Digital Reporting Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);
  
  // Listen on 0.0.0.0 for Railway (required for container networking)
  await app.listen(port, '0.0.0.0');
  
  const environment = process.env.NODE_ENV || 'development';
  console.log(`🚀 SafeHaven API running in ${environment} mode`);
  console.log(`📍 Server: http://0.0.0.0:${port}${globalPrefix}`);
  console.log(`📚 Swagger docs: http://0.0.0.0:${port}${globalPrefix}/docs`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`🔐 JWT: ${process.env.JWT_SECRET ? 'Configured' : 'Not configured'}`);
}

bootstrap();
