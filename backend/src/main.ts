import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LocalEnvironmentConfig } from '@/types'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService<LocalEnvironmentConfig>);

  const HOST = configService.get('BACKEND_HOST') ?? 'localhost';
  const PORT = configService.get('BACKEND_PORT') ?? 3000;

  const FRONTEND_HOST = configService.get('FRONTEND_HOST') ?? 'localhost';
  const FRONTEND_PORT = configService.get('FRONTEND_PORT') ?? 8000;

  const config = new DocumentBuilder()
    .setTitle('Avro Schema')
    .addServer(`http://${HOST}:${PORT}`)
    .setDescription('Avro Schema Registry')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    origin: `http://${FRONTEND_HOST}:${FRONTEND_PORT}`
  });

  await app.listen(PORT);
}

bootstrap();
