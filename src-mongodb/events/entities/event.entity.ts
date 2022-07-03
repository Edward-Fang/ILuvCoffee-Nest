import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'

@Schema()
export class Event extends mongoose.Document {
  @Prop()
  type: string

  @Prop({ index: true })
  name: string

  @Prop(mongoose.SchemaTypes.Mixed) // 表示可能有任何事件
  payload: Record<string, any>
}

export const EventSchema = SchemaFactory.createForClass(Event)
EventSchema.index({ name: 1, type: -1 })
