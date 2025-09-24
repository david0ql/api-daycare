import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory, Reflector } from '@nestjs/core';

import { AppModule } from './app.module';
import envVars from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle('Children\'s World API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  app.enableCors({
    origin: "*"
  });

  app.setGlobalPrefix('api');

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(envVars.PORT);
}
bootstrap();
