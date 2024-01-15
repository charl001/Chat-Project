import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { Room, RoomDocument } from '../schemas/room.schema';
import { Chat, ChatDocument } from '../schemas/chat.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>,
    @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
  ) {}

  /**
   * Finds an existing room between two users or creates a new one.
   * @param user1 - The ID of the first user.
   * @param user2 - The ID of the second user.
   * @returns The existing or newly created room.
   */
  async findOrCreateRoom(user1: string, user2: string): Promise<RoomDocument> {
    const existingRoom = await this.roomModel.findOne({
      participants: [{ userId: user1 }, { userId: user2 }],
    });

    if (existingRoom) {
      return existingRoom;
    }

    const uuid = randomUUID();
    const room = new this.roomModel({
      roomId: uuid,
      participants: [{ userId: user1 }, { userId: user2 }],
    });

    return await room.save();
  }

  /**
   * Saves a chat message to the database.
   * @param roomId - The ID of the room where the message is sent.
   * @param senderId - The ID of the message sender.
   * @param message - The content of the chat message.
   * @returns The saved chat message.
   */
  async saveChatMessage(roomId: string, senderId: string, message: string): Promise<Chat> {
    const newChat = new this.chatModel({
      roomId,
      senderId,
      message,
    });

    return await newChat.save();
  }

  /**
   * Retrieves the chat history for a specific room.
   * @param roomId - The ID of the room for which to fetch the chat history.
   * @returns An array of chat messages representing the chat history.
   */
  async getChatHistory(roomId: string): Promise<Chat[]> {
    return this.chatModel.find({ roomId }).exec();
  }

  /**
   * Finds a room by user ID and room ID.
   * @param userId - The ID of the user.
   * @param roomId - The ID of the room.
   * @returns The room document if the user is a participant; otherwise, null.
   */
  async findRoomByUserAndRoomId(userId: string, roomId: string): Promise<RoomDocument | null> {
    return this.roomModel
      .findOne({
        _id: roomId,
        participants: { $elemMatch: { userId } },
      })
      .exec();
  }
}
