import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './src/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  
  const port = process.env.PORT || 3000;
  const apiPrefix = (process.env.API_PREFIX || '/api').replace(/\/$/, '');
  const apiVersion = process.env.API_VERSION
    ? `/${process.env.API_VERSION.replace(/^\/+|\/+$/g, '')}`
    : '';
  const globalPrefix = `${apiPrefix}${apiVersion}`;

  app.setGlobalPrefix(globalPrefix);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL,
  ].filter((origin): origin is string => Boolean(origin));

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Only serve static assets if uploads directory exists
  try {
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads/',
    });
  } catch (error) {
    console.log('Uploads directory not found, skipping static assets');
  }
  
  const config = new DocumentBuilder()
    .setTitle('SafeHaven API')
    .setDescription('Violence, Abuse, and Bullying Digital Reporting Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);
  
  await app.listen(port);
  console.log(`SafeHaven API running on port ${port}`);
  console.log(`API available at ${globalPrefix}`);
  console.log(`Swagger docs available at ${globalPrefix}/docs`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
