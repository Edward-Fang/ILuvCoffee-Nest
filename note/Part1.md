## NestJS

### Getting Start

#### Basic

##### 配置

下载安装`Node.js`，在终端打印出如下说明则表示安装成功。

```shell
$ node -v
版本号
$ npm -v 
版本号
```

全局安装`@nestjs/cli`，在终端输入：

```shell
$ npm i -g @nestjs/cli
```

新建并启动一个`NestJS`项目：

```shell
$ nest new 项目名称
$ cd 项目目录
$ yarn start // 启动项目
$ yarn start:dev // 启动开发模式，保存更新后自动重启项目
```

##### 目录

```
src
 ├── app.controller.spec.ts  具有单个路由的基本控制器示例
 ├── app.controller.ts       对于基本控制器的单元测试样例
 ├── app.module.ts     		 应用程序的根模块
 ├── app.service.ts  		 带有单个方法的基本服务
 └── main.ts				 应用程序入口文件
```

### Creating a REST API application

#### Controller

##### 创建

```shell
$ nest generate controller coffees
$ nest g co modules/test coffees --no-spec
$ nest g co coffees --dry-run
```

`--no-spec`表示不生成`spec`文件，`--dry-run`表示查看`CLI`的模拟输出，实际上并不生成文件，`modules/test`表示文件夹存放的路径，不填写的话默认在`src`目录下。新建的`controller`会自动添加到`app.modules.ts`文件的`controllers`数组中。

##### 作用

 `@Controller()` 装饰器定义了基本的**控制器**。在 `@Controller()` 中使用路径前缀可以使我们轻松地对一组相关的路由进行分组，最大程度地减少重复代码。`coffees.controller.ts`文件中，字符串`coffees`传递给装饰器，将应用程序的`/coffees URL`绑定到这个控制器。但请求`http://localhost:3000/coffees`会报错，原因是缺少`GET HTTP`处理程序。

##### 装饰器

###### Get

从`@nest/common`中导入`Get`，并添加自定义的`findAll`方法，保存后重新请求就会返回定义的字符串。

```typescript
import { Controller, Get } from '@nestjs/common'
@Controller('coffees')
export class CoffeesController {
  @Get()
  findAll() {
    return 'this action returns all coffees'
  }
}
```

若想为这个`GET`请求添加一个**嵌套**`URL`，只需要在`@Get()`中添加想要的参数字符串，比如`@Get('flavors')`，同时请求路径改为`http://localhost:3000/coffees/flavors`就可以访问到数据。

###### Param

请求时携带**动态数据**，带有静态路径的路由将无法工作，需要使用`@Param()`装饰器。导入`Param`，添加`findOne`方法：

```typescript
@Get(':id')
findOne(@Param() params) {
  return `this action returns #${params.id} coffee`
}
```

访问`http://localhost:3000/coffees/123`会返回数据。这里的`params`表示整个参数对象，也可以指定传入某个参数：

```typescript
@Get(':id')
findOne(@Param('id') id: string) {
  return `this action returns #${id} coffee`
}
```

###### Post & Body

`Body`装饰器用于获取`request.body`的所有或特定部分。导入`Post`和`Body`，在`CoffeesController`中添加如下代码：

```typescript
@Post()
create(@Body() body) {
  return body
}
```

测试`POST`请求时，在`Body`中传入`JSON`格式的数据，返回的结果和传入的一样。若想控制输出的结果，可在`@Body()`中添加参数，但这样会有潜在的验证问题，因为如果访问指定属性，就不会验证其他属性。

###### Response Status Code

设置**响应状态码**。导入`HttpCode`和`HttpStatus`，在`@POST`装饰器下添加如下代码：

```typescript
@Post
@HttpCode(HttpStatus.GONE)
...
```

保存后重新发起请求，状态码转为`410 GONE`。

为了与底层 HTTP 平台（例如，`Express` 和 `Fastify`）之间的类型兼容， Nest 提供了 `@Res()`和 `@Response()` 装饰器。导入`Res`，修改`findAll`方法如下所示：

```typescript
findAll(@Res() response) {
  response.status(200).send('this action returns all coffees')
}
```

两者的效果相同，不过还是推荐用第一种方法。用第二种底层库的方法时，可能会依赖于平台，而且也会更难测试。[]()

###### Patch & Delete

**修改和删除**功能，使用`Patch`和`Delete`装饰器，在`CoffeesController`中添加如下代码：

```typescript
@Patch(':id')
update(@Param('id') id: string, @Body() body) {
  return `this action updates #${id} coffee`
}

@Delete(':id')
remove(@Param('id') id: string) {
  return `this action removes #${id} coffee`
}
```

分别发起`Patch`和`Delete`请求，两者都能正常返回预设的结果。

###### Query

**过滤或排序**请求的资源，类似于`@Param`和`@Body`。导入`Query`，修改`findAll`方法如下所示：

```typescript
findAll(@Query() paginationQuery) {
  const { limit, offset } = paginationQuery
  return `this action returns all coffees. limit: ${limit} offset: ${offset}`
}
```

设置请求的`URL`为`http://localhost:3000/coffees?limit=10&offset=20`，发起请求之后会收到`this action returns all coffees. limit: 10 offset: 20`信息，功能正常。

#### Service 

##### 创建

类似于`Controller`，直接选用简写方式：

```shell
$ nest g s coffees --no-spec
```

`CLI`会自动将创建好的`Service`包含在提供者`provider`数组中。在`Nest`中，每一个`service`都是一个`provider`，它可以注入依赖，意味着对象之间可以创建各种关系，并且将对象实例连接在一起的逻辑都可以由`Nest`运行时系统处理，而不是尝试自己创建和管理这种类型的依赖注入。

`provider`只是一个使用`@Injectable()`装饰器注解的类，刚刚创建的`CoffeesService`将**负责数据存储和检索**，旨在供`CoffeesService`或任何其他可能需要此功能的东西使用。

##### 注入依赖

在`CoffeesController`中定义一个构造函数，`Nest`会通过查看传递给构造函数的`parameters`的任何内容的类型来处理依赖注入。

```typescript
constructor(private readonly coffeeService: CoffeesService){}
```

装饰符`private`允许在同一位置立即`声明`和`初始化` `CoffeeService`，并且表明他只能在类本身内访问；关键字`readonly`确保我们不会修改所引用的服务，只能从中访问内容。依赖项已经解析并传递给构造函数或分配给此处指定的属性。

##### 样例

在`coffees`目录下新建`entities`文件夹，并创建`coffee.entity.ts`文件，添加属性：

```typescript
export class Coffee {
  id: number
  name: string
  brand: string
  flavors: string[]
}
```

在`CoffeeService`中添加数据，添加增删改查方法并在`CoffeesController`中调用：

```typescript
# coffees.service.ts
@Injectable()
export class CoffeesService {
  private coffees: Coffee[] = [
    {
      id: 1,
      name: 'Shipwreck Roast',
      brand: 'Buddy Brew',
      flavors: ['chocolate', 'vanilla'],
    },
  ];
  
  fineAll(){
    return this.coffees
  }
  findOne(){}
  create(){}
  update(){}
}

# coffees.controller.ts
@Get()
findAll(@Query() paginationQuery) {
  return this.coffeeService.findAll()
}
@Get(':id')
findOne(@Param('id') id: string) {
  return this.coffeeService.findOne(id)
}...
```

测试四种请求时，能够正常运行。

##### 错误提示

当请求的商品不存在时，可以用`HttpException`来返回错误提示。导入`HttpException`并修改`findOne`的代码如下所示：

```typescript
findOne(id: string) {
  const coffee = this.coffees.find((item) => item.id === +id)
  if (!coffee) {
    throw new HttpException(`coffee #${id} not found`, HttpStatus.NOT_FOUND)
  }
  return Coffee
}
```

`HttpException`有两个参数，分别是提示语和状态码。向`http://localhost:3000/coffees/2`发起`GET`请求，能够返回预设的结果。

`Nest`还提供了更简便的错误提示方法，明确需要返回什么内容时可以使用，比如：`NotFoundException`、`InternalServerErrorException`、`BadRequestException`等等。

修改抛出错误的部分：

```typescript
throw new NotFoundException(`coffee #${id} not found`)
```

请求后的结果也是`404 NotFound`。

若不使用`Nest`中的方法，直接使用`throw`抛出错误的话，会返回`500 internal Server Error`：

```typescript
findOne(id: string) {
  throw 'Error'
}
```

#### Module

类似于整个功能模块的**入口文件**，整合了`Controller`和`Service`。新建的`module`会被添加到最近的模块的引用队列。

创建方法与上面的类似：

```shell
$ nest g module coffees
```

这样`coffee`文件夹下面就有`controller`、`service`、`entity`和`module`四部分。

新建的`module`文件如下所示：

```typescript
import { Module } from '@nestjs/common';

@Module({})
export class CoffeesModule {}
```

`@Module`模块装饰器采用单个对象的属性来描述模块及其所有上下文，包含内容有：

```
@Module
 ├── controllers  作为模块实例化的 API根
 ├── exports 	  包含当前模块中应该在任何地方都可用的 Providers
 ├── imports      包含程序运行的的其他模块
 └── providers    包含需要由 Nest注入器实例化的服务，只在本模块能使用
```

将`CoffeesController`和`CoffeesService`引入进文件，修改之后的代码如下：

```typescript
import { Module } from '@nestjs/common'
import { CoffeesController } from './coffees.controller'
import { CoffeesService } from './coffees.service'

@Module({ controllers: [CoffeesController], providers: [CoffeesService] })
export class CoffeesModule {}
```

还有记得修改`app.module.ts`中的代码，防止`CoffeesController`和`CoffeesService`实例化两遍：

```typescript
@Module({
  imports: [CoffeesModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
```

#### DTO

**数据传输对象**`data transfer object`(`DTO`)，用于封装数据并将其从一个应用程序发送到另一个应用程序，不包含任何业务逻辑、方法或任何需要测试的东西。`DTO`还可将所有属性标记为只读，以保持不变性。

##### 样例

生成`DTO`，用`CLI`简单生成一个基本类：

```shell
$ nest g class coffees/dto/create-coffee.dto --no-spec
```

将本次创建的`CreateCoffeeDTO`作为`CoffeeController`的`POST`请求的预期输入对象样式，将`entity`中除`id`属性以外的属性复制到`CreateCoffeeDTO`中，为保持不变性还可添加`readonly`关键字：

```typescript
export class CreateCoffeeDto {
  readonly name: string
  readonly brand: string
  readonly flavors: string[]
}
```

可以发现这和`entity`中定义的差别不大，原因是目前处理的是模拟实体不是外部数据，深入学习就能了解差异。

修改`Post`请求中的代码：

```typescript
@Post()
create(@Body() CreateCoffeeDto: CreateCoffeeDto) {
  return this.coffeeService.create(CreateCoffeeDto)
}
```

接着创建`update-coffee.dto.ts`文件，添加相同的数据，但此处的属性都是可选的：

```typescript
export class UpdateCoffeeDto {
  readonly name?: string
  readonly brand?: string
  readonly flavors?: string[]
}
```

修改`Patch`请求中的代码：

```typescript
@Patch(':id')
update(@Param('id') id: string, @Body() UpdateCoffeeDto: UpdateCoffeeDto) {
  return this.coffeeService.update(id, UpdateCoffeeDto)
}
```

##### ValidationPipe

###### 样例

`DTO`为进入`API`请求主体的数据的样式创建了定义，但上面的代码无法保证传入的数据具有正确的样式或者必填字段，还需要验证应用程序的数据的正确性，`ValidationPipe`提供了一种对所有传入客户端有效负载强制执行验证规则的便捷方式。

在`mian.ts`中导入`ValidationPipe`包，添加以下代码：

```typescript
app.useGlobalPipes(new ValidationPipe())
```

还要导入两个包，在终端输入以下指令：

```shell
$ yarn add class-validator class-transformer
```

在`create-coffee.dto.ts`文件中设置验证方式：

```typescript
import { IsString } from 'class-validator'

export class CreateCoffeeDto {
  @IsString()
  readonly name: string

  @IsString()
  readonly brand: string

  @IsString({ each: true }) // {each: true}表示期望值是一个字符串数组
  readonly flavors: string[]
}
```

测试`POST`接口，在请求体中设置`JSON`格式并添加以下代码：

```json
{
  "name": "Shipwreck Roast"
}
```

返回体如下所示：

```json
{
  "statusCode": 400,
  "message": [
      "brand must be a string",
      "each value in flavors must be a string"
  ],
  "error": "Bad Request"
}
```

说明添加的验证功能生效。

###### PartialType

`CreateCoffeeDTO`和`UpdateCofeeDTO`存在代码冗余，下载`@nestjs/mapped-types`来解决问题：

```shell
$ yarn add @nestjs/mapped-types
```

修改`UpdateCoffeeDTO`中的代码如下：

```typescript
import { PartialType } from '@nestjs/mapped-types'
import { CreateCoffeeDto } from './create-coffee.dto'
export class UpdateCoffeeDto extends PartialType(CreateCoffeeDto) {}
```

`PartialType`能够返回我们传递给它的类，而且标记所有字段都是可选的。他继承了装饰器应用的所有验证规则，以及动态添加附加验证规则`@IsOptional()`到每个字段。测试`PATCH`请求，在请求体中设置`JSON`格式并添加以下代码：

```json
{
  "name": "Shipwreck Roast"
}
```

接口返回状态码为`200 OK`，说明测试成功。测试其他请求数据也一样能返回期望的结果。

###### whitelist

可以通过`whitelist`来过滤掉没有设置处理方法的属性，未包含在白名单的属性会自动从生成的对象中剥离。

本项目中，在执行`CreateCoffee`的操作时，要是添加了不需要的属性，会被自动剥离或删除。

修改`main.ts`文件中的代码，启动白名单设置，并且在`create`方法中返回传入的`createCoffeeDto`：

```typescript
# main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true
  })
)

# coffees.service.ts
create(createCoffeeDto: any) {
  ...
  return createCoffeeDto
}
```

测试`POST`接口时，在`JSON`数据中传入其他未定义的属性，返回的结果中是不包含多余的属性的：

```json
# 请求的数据
{
  "name": "Shipwreck Roast",
  "brand": "Buddy Brew",
  "flavors": ["chocolate", "vanilla"],
  "isEnabled": true
}

# 返回的数据
{
  "name": "Shipwreck Roast",
  "brand": "Buddy Brew",
  "flavors": [
    "chocolate",
    "vanilla"
  ]
}
```

###### forbidNonWhitelisted

与`whitelist`相似的还有`forbidNonWhitelisted`，设置这个为`true`时，当请求的参数中带有不需要的参数时会报错，内容如下：

```json
{
  "statusCode": 400,
  "message": [
    "property isEnabled should not exist"
  ],
  "error": "Bad Request"
}
```

###### transform

当收到带有有效负载的请求时，通常会作为纯`JavaScript`对象通过网络传输，但如何确保有效载荷的形状符合预期呢？

在`create`方法中添加`console.log(createCoffeeDto instanceof CreateCoffeeDto)`，发起请求，会发现输出的是`false`，说明

参数中的`CreateCoffeeDTO`实际上不是`CreateCoffeeDTO`的实例，可以通过设置`transform`来转换。

在`ValidationPipe`参数对象中添加`transform: true`，重新发起请求，此时终端输出的是`true`。

此外，`transform`还有自动转换功能，可以为布尔值和数字等内容执行原始类型转换。

默认情况下，路径参数和查询参数都是字符串。修改`coffees.controller.ts`的`findOne`方法：

```typescript
@Get(':id')
findOne(@Param('id') id: number) {
  console.log(typeof id)
  return this.coffeeService.findOne('' + id)
}
```

发送`GET`请求，会发现输出的是`number`，即`id`的类型是`number`。
