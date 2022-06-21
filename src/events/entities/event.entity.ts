import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm'

// index索引用来快速访问
@Index(['type', 'name'])
@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  type: string

  @Column()
  name: string

  @Column('json')
  payload: Record<string, any>
}
