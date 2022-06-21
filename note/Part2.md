### Add PostgreSQL with TypeORM

#### Docker

##### 下载

去[Docker官网](https://www.docker.com/get-started/)下载安装

##### 配置

在根目录添加`docker-compose.yml`配置文件，内容如下：

```yaml
version: '3'

services:
  db:
    image: postgres
    restart: always
    ports:
      - '5432:5432'
    environment:
      POSTGRES_PASSWORD: pass123
```

通过命令`docker-compose up -d`创建数据库

#### TypeORM

##### 添加依赖

```shell
$ yarn add @nestjs/typeorm typeorm pg
```

在`app.module.ts`中添加以下代码：

```typescript
imports: [
  TypeOrmModule.forRootAsync({
    useFactory: () => ({
      type: 'postgres',
      host: 'localhost',
      port: 5432, // yml中设置
      username: 'postgres', // 访问数据库的用户名，未设置采用默认
      password: 'pass123', // yml中设置
      database: 'postgres', // 连接的数据库名
      autoLoadEntities: true, // 自动加载模块
      synchronize: true
    })
  })
]
```

`autoLoadEntities`表示同步，让`TypeORM`自动从所有使用`@Entity()`装饰器的类中生成一个`SQL`表，以及他们包含的数据，确保TypeORM实体在运行时与数据库同步，仅用于开发模式，生产模式须禁用。

重新运行项目，可以在终端看到`TypeORMModule`依赖项已初始化，说明已成功建立了与`Docker Postgres`数据库的连接。

##### 创建实体

**实体**表示**TypeScript类**与**数据库表**之间的关系。在`Nest`中，实体是使用`@Entity`装饰器装饰的类。

修改`coffee.entity.ts`中的代码：

```typescript
import { Column,Entity } from 'typeorm'
import { Flavor } from './flavor.entity'

// 一个 Entity类代表一个 SQL表
@Entity() // sql table === 'coffee'  数据表名默认是小写类名，可在()内设置想要的名称
export class Coffee {
  @PrimaryGeneratedColumn() // 设置id为主键
  id: number

  @Column()
  name: string

  @Column()
  brand: string

  @Column('json', { nullable: true })
  flavors: Flavor[]
}
```

`@Column('json', { nullable: true })`表示数组存储为`JSON`，且可以为空。

最后使用`TypeOrmModule.forFeature()`函数，参数为数组，在`coffees.module.ts`中注册实体：

```typescript
import { TypeOrmModule } from '@nestjs/typeorm'
import { Coffee } from './entities/coffee.entity'
...
imports: [TypeOrmModule.forFeature([Coffee])]
```

##### 使用仓库

之前测试用的是模拟数据，现在采用真实数据库，引入`typeorm`中的`Repository`并修改代码：

```typescript
import { Repository } from 'typeorm'
...
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>
  ){}
    
  findAll() {
    return this.coffeeRepository.find()
  }

  async findOne(id: string) {
    const coffee = await this.coffeeRepository.findOne(id)
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`)
    }
    return coffee
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    const coffee = this.coffeeRepository.create(createCoffeeDto)
    return this.coffeeRepository.save(coffee)
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    // preload会先查看数据库是否存在实体，存在则检索它及其相关的所有内容
    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto
    })
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`)
    }
    return this.coffeeRepository.save(coffee)
  }

  // remove()方法中不用判断是否存在，findOne()方法会自动为我们处理
  async remove(id: string) {
    const coffee = await this.findOne(id)
    return this.coffeeRepository.remove(coffee)
  }
}
```

测试四种请求，都可达到预期的效果。

#### Relation

##### 定义

**关系**是基于每个表的公共字段的两个或多个表之间的关联，通常涉及**主键**和**外键**。有三种关系，分别是**一对一**、**一对多**或**多对一**、**多对多**，在`TypeORM`中，分别使用`@OneToOne`、`@OneToMany`或`@ManyToOne`、`@ManyToMany`装饰器来定义这些类型。

在本项目中，`coffee.entity.ts`中的`flavors`字段之前被标记为`JSON`类型，现在我们将使用关系并指向一个新的`flavors`表中的多个条目。

通过命令行创建新的`flavors`表：

```shell
$ nest g class coffees/entities/flavor.entity --no-spec
```

修改`coffee.entity.ts`中的代码：

```typescript
import {
  Entity,
  JoinTable,
  ManyToMany
} from 'typeorm'
import { Flavor } from './flavor.entity'

@Entity()
export class Coffee {
  ...
  @JoinTable()
  @ManyToMany(type => Flavor, flavor => flavor.coffees)
  flavors: Flavor[]
}
```

`@ManyToMany()`装饰器：第一个参数指关联的类型；第二个参数是返回相应实体及指定选择的属性。这时会报错`Flavor`实体不存在`coffees`属性，先不处理。

关于第一个参数官网原文如下：

由于特定于语言的关系，我们只能使用一个返回类的函数，而不是直接使用该类。 同时也可以把它写成`()=> Photo`，但是`type => Photo`显得代码更有可读性。`type`变量本身不包含任何内容。

`Flavor`实体只需要`id`和`name`两个字段，接着定义与`Coffee`的关系：

```typescript
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Coffee } from './coffee.entity'

@Entity()
export class Flavor {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @ManyToMany(type => Coffee, coffee => coffee.flavors)
  coffees: Coffee[]
}
```

最后，将`Flavors`添加到`CoffeeModule`中的`TypeORM.forFeature`数组中：

```typescript
imports: [
  TypeOrmModule.forFeature([Coffee, Flavor])
]
```

完成之后，`CoffeeEntity`中的`flavors`字段与`FlavorEntity`中的`coffees`字段关联在一起。运行程序时，`TypeORM`会自动为我们添加这些表。

##### 问题1

定义了`Coffees`与`Flavors`的关系后，请求的相应结果也不会出现`flavors`字段，因为默认情况下不会快速加载关系。

###### 解决

在调用仓库的`findOne()`方法时，必须明确指定要解决的关系。修改`CoffeeService`中的两个`GET`请求处理方法：

```typescript
# findAll()
return this.coffeeRepository.find({
  relations: ['flavors']
})

# findOne()
const coffee = await this.coffeeRepository.findOne(id, {
  relations: ['flavors']
})
```

再次发起两种请求时，就能看到`flavors`字段，下面为`findAll()`的响应结果：

```json
[
  {
    "id": 1,
    "name": "name1",
    "brand": "brand1",
    "flavors": []
  }
]
```

##### 问题2

当遇到需要将新`Coffee`添加到数据库中，但`Flavor`表中没有它的`Flavor`情况时，我们可以手动将这些新`Flavors`插入进数据库，然后创建一个新的`Coffees`实体，但这并不是理想的方法。

###### 解决

采用**级联插入**，要启用这个功能，先在关系内部将`Cascade`属性设置为`true`：

```typescript
# coffee.entity.ts
@ManyToMany(type => Flavor, flavor => flavor.coffees, {
  cascade: true // 开启级联
})
```

添加了这个功能之后，属于新创建的`Coffee`的`Flavor`将自动插入到数据库中。

###### 映射

回顾之前做的`DTO`，`create-coffee.dto.ts`包含一个`flavors`字符串数组，我们需要确保这些字符串映射到真实的`Flavor`实体，还有需要改进的地方。

首先将`Flavor Repository`注入到`CoffeesService`，接着定义`preloadFlavorByName()`方法，然后在`create()`和`update()`方法中使用它：

```typescript
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
  
private async preloadFlavorByName(name: string): Promise<Flavor> {
  const existingFlavor = await this.flavorRepository.findOne({ name })
  if (existingFlavor) {
    return existingFlavor
  }
  return this.flavorRepository.create({ name })
}
```

`preloadFlavorByName()`方法将`flavors`中的`flavor`作为入参并返回一个解析为真实`Flavor`实体的`Promise`，如果数据库中已存在则返回它，否则会使用传入的`flavor`创建一个新的实例。重新运行程序，发起请求验证是否成功。

#### Pagination

之前的内容也用到过`Pagination`，这里配合`relation`使用。

先生成`pagination-query.dto.ts`文件作为公共文件：

```shell
$ nest g class common/dto/Pagination-query.dto --no-spec
```

在`PaginationQueryDto`中添加`limit`和`offset`属性：

```typescript
import { IsOptional, IsPositive } from 'class-validator'

export class PaginationQueryDto {
  @IsPositive() // 判断值是否是正数
  @IsOptional() // 将该属性标记为“可选”的
  limit: number

  @IsPositive()
  @IsOptional()
  offset: number
}
```

还可使用`@Type()`装饰器，确保传入的值被解析为数字，和之前的`@Param()`装饰器类似。但不如直接在`ValidationPipe()`中添加`transformOptions`选项，以达到可以隐式转换的目的：

```typescript
new ValidationPipe({
  transformOptions: {
    enableImplicitConversion: true
  }
})
```

最后，修改`findAll()`方法：

```typescript
findAll(paginationQuery: PaginationQueryDto) {
  const { limit, offset } = paginationQuery
  return this.coffeeRepository.find({
    relations: ['flavors'],
    skip: offset,
    take: limit
  })
}
```

测试请求如`http://localhost:3000/coffees?limit=1&offset=1`可以收到预期的响应结果。

#### Transactions

