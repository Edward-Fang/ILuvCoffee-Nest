import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel, InjectConnection } from '@nestjs/mongoose'
import { Model, Connection } from 'mongoose'
import { PaginationQueryDto } from '../common/dto/pagination-query.dto'
import { Event } from '../events/entities/event.entity'
import { CreateCoffeeDto } from './dto/create-coffee.dto'
import { UpdateCoffeeDto } from './dto/update-coffee.dto'
import { Coffee } from './entities/coffee.entity'

@Injectable()
export class CoffeesService {
  constructor(
    @InjectModel(Coffee.name) private readonly coffeeModel: Model<Coffee>,
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Event.name) private readonly eventModel: Model<Event>
  ) {}

  findAll(paginationQueryDto: PaginationQueryDto) {
    const { limit, offset } = paginationQueryDto
    return this.coffeeModel.find().skip(offset).limit(limit).exec()
  }

  async findOne(id: string) {
    const coffee = await this.coffeeModel.findOne({ _id: id }).exec()
    if (!coffee) throw new NotFoundException(`Coffee ${id} is not found`)
    return coffee
  }

  create(createCoffeeDto: CreateCoffeeDto) {
    const coffee = new this.coffeeModel(createCoffeeDto)
    return coffee.save()
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const existingCoffee = await this.coffeeModel
      .findOneAndUpdate({ _id: id }, { $set: updateCoffeeDto }, { new: true })
      .exec()

    if (!existingCoffee)
      throw new NotFoundException(`Coffee ${id} is not found`)
    return existingCoffee
  }

  async remove(id: string) {
    const coffee = await this.findOne(id)
    return coffee.remove()
  }

  async recommendCoffee(coffee: Coffee) {
    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      coffee.recommendations++

      const recommendEvent = new this.eventModel({
        name: 'recommend_coffee',
        type: 'coffee',
        payload: { coffeeId: coffee.id }
      })
      await recommendEvent.save()
      await coffee.save({ session })

      await session.commitTransaction()
    } catch (e) {
      await session.abortTransaction()
    } finally {
      session.endSession()
    }
  }
}