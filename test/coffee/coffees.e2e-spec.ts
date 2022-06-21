import { Test, TestingModule } from '@nestjs/testing'
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import * as request from 'supertest'
import { CoffeesModule } from '../../src/coffees/coffees.module'
import { CreateCoffeeDto } from '../../src/coffees/dto/create-coffee.dto'

describe('AppController (e2e)', () => {
  const coffee = {
    name: 'name1',
    brand: 'brand1',
    flavors: ['item1', 'item2']
  }
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        CoffeesModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5433,
          username: 'postgres',
          password: 'pass123',
          database: 'postgres',
          autoLoadEntities: true,
          synchronize: true
        })
      ]
    }).compile()

    app = moduleFixture.createNestApplication()
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
    await app.init()
  })

  it('Create [Post /]', () => {
    return request(app.getHttpServer())
      .post('/coffees')
      .send(coffee as CreateCoffeeDto)
      .expect(HttpStatus.CREATED)
      .then(({ body }) => {
        const expectedCoffee = jasmine.objectContaining({
          ...coffee,
          flavors: jasmine.arrayContaining(
            coffee.flavors.map(name => jasmine.objectContaining({ name }))
          )
        })
        expect(body).toEqual(expectedCoffee)
      })
  })
  it.todo('Get all [Get /]')
  it.todo('Get One [Get /:id]')
  it.todo('Update One [Patch /:id]')
  it.todo('Delete One [Delete /:id]')

  afterAll(async () => {
    await app.close()
  })
})
