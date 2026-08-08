import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import type { Request, Response } from 'express';

let cachedServer: any = null;

async function bootstrapServer() {
  if (!cachedServer) {
    const expressApp = require('express')();
    const adapter = new ExpressAdapter(expressApp);
    
    const app = await NestFactory.create(AppModule, adapter, {
      logger: false, // Disable logging for serverless
    });

    const apiPrefix = '/api';
    const apiVersion = '/v1';
    const globalPrefix = `${apiPrefix}${apiVersion}`;

    app.setGlobalPrefix(globalPrefix);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: false,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    );

    app.enableCors({
      origin: true, // Allow all origins for now
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    await app.init();
    cachedServer = expressApp;
  }
  
  return cachedServer;
}

export default async function handler(req: Request, res: Response) {
  const server = await bootstrapServer();
  return server(req, res);
}
