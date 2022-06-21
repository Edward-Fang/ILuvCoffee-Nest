import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filter/http-exception.filter'
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor'
// import { ApiKeyGuard } from './common/guard/api-key.guard'
import { WrapResponseInterceptor } from './common/interceptors/wrap-response.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  )
  app.useGlobalFilters(new HttpExceptionFilter())
  // app.useGlobalGuards(new ApiKeyGuard())
  app.useGlobalInterceptors(
    new WrapResponseInterceptor(),
    new TimeoutInterceptor()
  )
  const options = new DocumentBuilder()
    .setTitle('Iluvcoffee')
    .setDescription('Coffee application')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('api', app, document)
  await app.listen(3000)
}
bootstrap()
