import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  // SetMetadata,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { PaginationQueryDto } from '../common/dto/pagination-query.dto'
import { CoffeesService } from './coffees.service'
import { CreateCoffeeDto } from './dto/create-coffee.dto'
import { UpdateCoffeeDto } from './dto/update-coffee.dto'
import { Request } from 'express'
import { REQUEST } from '@nestjs/core'
import { Public } from '../common/decorators/public.decorator'
import { ParseIntPipe } from '../common/pipes/parse-int.pipe'
import { Protocol } from '../common/decorators/protocol.decorator'
import { ApiForbiddenResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('coffees')
@UsePipes(ValidationPipe)
@Controller('coffees')
export class CoffeesController {
  constructor(
    private readonly coffeeService: CoffeesService,
    @Inject(REQUEST) private readonly request: Request
  ) {
    // console.log('CoffeesController Created')
  }

  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @Public()
  @Get()
  async findAll(
    @Protocol('https') protocol: string,
    @Query() paginationQuery: PaginationQueryDto
  ) {
    console.log(protocol)
    // const { limit, offset } = paginationQuery;
    // await new Promise(resolve => setTimeout(resolve, 5000))
    return this.coffeeService.findAll(paginationQuery)
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    console.log(id)
    return this.coffeeService.findOne('' + id)
  }

  @Post()
  create(@Body() createCoffeeDto: CreateCoffeeDto) {
    return this.coffeeService.create(createCoffeeDto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoffeeDto: UpdateCoffeeDto) {
    return this.coffeeService.update(id, updateCoffeeDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coffeeService.remove(id)
  }
}
