import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.contoller';
import { UserService } from './services/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { ChatSchema } from './schemas/chat.schema';
import { RoomSchema } from './schemas/room.schema';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './guards/jwt-auth.guard';
import { ChatGateway } from './gateway/chat.gateway';
import { ChatService } from './services/chat.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/charul'),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Chat', schema: ChatSchema },
      { name: 'Room', schema: RoomSchema },
    ]),
    JwtModule.register({
      secret: 'test123',
      signOptions: { expiresIn: '3h' },
    }),
  ],
  controllers: [UserController],
  providers: [ UserService,ChatGateway,ChatService],
})
export class AppModule {}
