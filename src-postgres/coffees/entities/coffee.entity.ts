import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Flavor } from './flavor.entity'

// 一个 Entity类代表一个 SQL表
@Entity() // sql table === 'coffee'  数据表名默认是小写类名，可在()内设置
export class Coffee {
  @PrimaryGeneratedColumn() // 设置id为主键
  id: number

  @Column()
  name: string

  @Column({ nullable: true })
  description: string

  @Column()
  brand: string

  @Column({ default: 0 })
  recommendations: number

  @JoinTable()
  @ManyToMany(type => Flavor, flavor => flavor.coffees, {
    // 开启级联
    cascade: true
  })
  flavors: Flavor[]
}
