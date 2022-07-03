import { Module } from '@nestjs/common'
import { CoffeesModule } from '../coffees/coffees.module'
import { DatabaseModule } from '../database/database.module'
import { CoffeeRatingService } from './coffee-rating.service'

@Module({
  imports: [
    DatabaseModule.register({
      type: 'postgres',
      host: 'localhost',
      username: 'postgres', // 视频中没有，网上找不到解决办法
      password: 'pass123',
      port: 5432
    }),
    CoffeesModule
  ],
  providers: [CoffeeRatingService]
})
export class CoffeeRatingModule {}
