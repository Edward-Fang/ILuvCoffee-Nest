/* eslint-disable prettier/prettier */
import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { PaginationQueryDto } from '../common/dto/pagination-query.dto'
import { Connection, Repository } from 'typeorm'
import { CreateCoffeeDto } from './dto/create-coffee.dto'
import { UpdateCoffeeDto } from './dto/update-coffee.dto'
import { Coffee } from './entities/coffee.entity'
import { Flavor } from './entities/flavor.entity'
import { Event } from '../events/entities/event.entity'
// import { COFFEE_BRANDS } from './coffees.constants'
// import { ConfigService, ConfigType } from '@nestjs/config'
// import coffeesConfig from './config/coffees.config'

// @Injectable({ scope: Scope.REQUEST })
@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
    private readonly connection: Connection
    // private readonly configService: ConfigService,
    // @Inject(coffeesConfig.KEY)
    // private readonly coffeesConfiguration: ConfigType<typeof coffeesConfig>,
    // @Inject(COFFEE_BRANDS) coffeeBrands: string[]
  ) {
    // console.log('CoffeesService instantiated')
    // const coffeesConfig = this.configService.get('coffees.foo')
    // console.log(coffeesConfiguration.foo);
  }

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery
    return this.coffeeRepository.find({
      relations: ['flavors'],
      skip: offset,
      take: limit
    })
  }

  async findOne(id: string) {
    const coffee = await this.coffeeRepository.findOne(id, {
      relations: ['flavors']
    })
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`)
    }
    return coffee
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    const flavors = await Promise.all(
      createCoffeeDto.flavors.map(name => this.preloadFlavorByName(name))
    )

    const coffee = this.coffeeRepository.create({ ...createCoffeeDto, flavors })
    return this.coffeeRepository.save(coffee)
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const flavors =
      updateCoffeeDto.flavors &&
      (await Promise.all(
        updateCoffeeDto.flavors.map(name => this.preloadFlavorByName(name))
      ))

    // preload会先查看数据库是否存在实体，存在则检索它及其相关的所有内容
    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto,
      flavors
    })
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`)
    }
    return this.coffeeRepository.save(coffee)
  }

  async remove(id: string) {
    const coffee = await this.findOne(id)
    return this.coffeeRepository.remove(coffee)
  }

  async recommendCoffee(coffee: Coffee) {
    const queryRunner = this.connection.createQueryRunner()

    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      coffee.recommendations++

      const recommendEvent = new Event()
      recommendEvent.name = 'recommend_coffee'
      recommendEvent.type = 'coffee'
      recommendEvent.payload = { coffeeId: coffee.id }

      await queryRunner.manager.save(coffee)
      await queryRunner.manager.save(recommendEvent)

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
    } finally {
      await queryRunner.release()
    }
  }

  private async preloadFlavorByName(name: string): Promise<Flavor> {
    const existingFlavor = await this.flavorRepository.findOne({ name })
    if (existingFlavor) {
      return existingFlavor
    }
    return this.flavorRepository.create({ name })
  }
}
