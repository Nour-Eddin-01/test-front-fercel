import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TradeHubLogger } from './common/logger/logger.service';
import { DocumentBuilder , SwaggerModule } from '@nestjs/swagger';

async function bootstrap()
{
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

  // ADDED: Create the app with your custom logger
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Recommended when using custom loggers
  });

  // ADDED: Tell NestJS to use your TradeHubLogger globally
  app.useLogger(new TradeHubLogger());

  app.useGlobalPipes(
    new ValidationPipe(
      {
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      },
    ),
  );
  
  app.enableCors(
    {
      origin:      'http://localhost:5173',
      methods:     'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    }
  );

  const   config = new  DocumentBuilder()
                   .setTitle('TradeHub API')
                   .setDescription('API documentation for TradeHub application')
                   .setVersion('1.0')
                   .build();

  const   apiDocument = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, apiDocument);                   

  await app.listen(3000);
}

bootstrap();