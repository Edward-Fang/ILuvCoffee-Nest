import { Injectable, Module, Scope } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Connection } from 'typeorm'
import { Event } from '../events/entities/event.entity'
import { COFFEE_BRANDS } from './coffees.constants'
import { CoffeesController } from './coffees.controller'
import { CoffeesService } from './coffees.service'
import coffeesConfig from './config/coffees.config'
import { Coffee } from './entities/coffee.entity'
import { Flavor } from './entities/flavor.entity'

class ConfigService {}
class DevelopmentConfigService {}
class ProductionConfigService {}

@Injectable()
export class CoffeeBrandsFactory {
  create() {
    return ['buddy brew', 'nescafe']
  }
}

@Module({
  imports: [
    TypeOrmModule.forFeature([Coffee, Flavor, Event]),
    ConfigModule.forFeature(coffeesConfig)
  ],
  controllers: [CoffeesController],
  // 简写形式: providers: [CoffeesService]
  // 完整形式：
  providers: [
    CoffeesService,
    CoffeeBrandsFactory,
    {
      provide: ConfigService,
      useClass:
        process.env.NODE_ENV === 'development'
          ? DevelopmentConfigService
          : ProductionConfigService
    },
    // {
    //   provide: COFFEE_BRANDS,
    //   useValue: ['buddy brew', 'nescafe']
    // },
    // {
    //   provide: COFFEE_BRANDS,
    //   useFactory: (brandsFactory: CoffeeBrandsFactory) =>
    //     brandsFactory.create(),
    //   inject: [CoffeeBrandsFactory]
    // },
    {
      provide: COFFEE_BRANDS,
      useFactory: async (connection: Connection): Promise<string[]> => {
        const coffeeBrands = await Promise.resolve(['buddy brew', 'nescafe'])
        return coffeeBrands
      },
      inject: [Connection]
    }
  ],
  exports: [CoffeesService]
})
export class CoffeesModule {}
