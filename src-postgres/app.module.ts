import { Module, ValidationPipe } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
// import * as Joi from '@hapi/Joi'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CoffeesModule } from './coffees/coffees.module'
import { CoffeeRatingModule } from './coffee-rating/coffee-rating.module'
import { DatabaseModule } from './database/database.module'
import appConfig from './config/app.config'
// import { APP_PIPE } from '@nestjs/core'
import { CommonModule } from './common/common.module'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: +process.env.DATABASE_PORT, // yml中设置
        username: process.env.DATABASE_USER, // 默认
        password: process.env.DATABASE_PASSWORD, // yml中设置
        database: process.env.DATABASE_NAME,
        autoLoadEntities: true, // 自动加载模块
        synchronize: true // 同步  仅用于开发模式
      })
    }),
    ConfigModule.forRoot({
      // envFilePath: '.environment'
      // ignoreEnvFile: true

      // validationSchema: Joi.object({
      //   DATABASE_HOST: Joi.required(),
      //   DATABASE_PORT: Joi.number().default(5432)
      // })

      load: [appConfig]
    }),
    CoffeesModule,
    CoffeeRatingModule,
    DatabaseModule,
    CommonModule
  ],
  controllers: [AppController],
  providers: [
    AppService
    // {
    //   provide: APP_PIPE,
    //   useClass: ValidationPipe
    // }
  ]
})
export class AppModule {}
