


// room.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoomDocument = Room & Document;

@Schema()
export class Room {
  @Prop({ required: true })
  roomId: string;

  @Prop({ required: true })
  participants: [{ userId: string }];

}

export const RoomSchema = SchemaFactory.createForClass(Room);
