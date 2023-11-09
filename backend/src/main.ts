import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LocalEnvironmentConfig } from '@/types'
import { computeUrls } from '@/url.computed'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService<LocalEnvironmentConfig>);

  const {
    BACKEND_URL, BACKEND_PORT,
    FRONTEND_URL, CORS_ORIGIN,
  } = computeUrls(configService);

  const config = new DocumentBuilder()
    .setTitle('Avro Schema')
    .addServer(BACKEND_URL.href)
    .setDescription('Avro Schema Registry')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    origin: [
      FRONTEND_URL.href.replace(/\/$/, ''),  // remove trailing slash
      CORS_ORIGIN.split(' ')
    ]
  });

  await app.listen(BACKEND_PORT);
}

bootstrap();
