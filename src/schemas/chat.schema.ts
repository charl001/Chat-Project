// chat.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema()
export class Chat {
    @Prop({ required: true })
    roomId: string;

    @Prop({ required: true })
    senderId: string;

    @Prop({ required: true })
    receiverId: string;

    @Prop({ required: true })
    message: string;

}

export const ChatSchema = SchemaFactory.createForClass(Chat);
