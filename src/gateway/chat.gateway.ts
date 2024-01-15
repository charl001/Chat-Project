import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from '../services/chat.service';

@Injectable()
@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server

    constructor(
        private readonly jwtService: JwtService,
        private readonly chatService: ChatService,
    ) { }

    /**
     * Handles a new WebSocket connection.
     * @param client - The WebSocket client.
     * @param args - Additional connection arguments.
     */
    async handleConnection(client: Socket, ...args: any[]): Promise<any> {
        try {
            const token = this.extractTokenFromHeaders(client.handshake.headers);

            if (!token) {
                client.disconnect(true);
                return;
            }

            const decodedToken = await this.jwtService.verify(token);

            if (!decodedToken) {
                client.disconnect(true);
                return;
            }

            client["user"] = decodedToken.userId;

        } catch (error) {
            client.disconnect(true);
            return  new Error(error);
            
        }
    }

    /**
     * Handles a WebSocket disconnection.
     * @param client - The disconnected WebSocket client.
     */
    handleDisconnect(client: Socket): any {
        client.disconnect(true);
    }

    /**
     * Handles the 'joinRoom' message, allowing a user to join a chat room.
     * @param client - The WebSocket client.
     * @param otheruserId - The ID of the other user to join the room with.
     */
    @SubscribeMessage('joinRoom')
    async handleJoinRoom(client: Socket, otheruserId: string) {
        let clientId = client["user"];
        const room = await this.chatService.findOrCreateRoom(clientId, otheruserId);
        client.join(room.roomId);
        client.emit('joinedRoom', room);
        const chatHistory = await this.chatService.getChatHistory(room.roomId);
        this.server.to(room.roomId).emit('chatHistory', { history: chatHistory });
    }

    /**
     * Handles the 'chatToServer' message, allowing a user to send a chat message.
     * @param client - The WebSocket client.
     * @param payload - The payload containing room ID and message.
     */
    @SubscribeMessage('chatToServer')
    async handleChatToServer(client: Socket, payload: { room: string, message: string }) {
        await this.chatService.saveChatMessage(payload.room, this.getUserIdFromSocket(client), payload.message);
        this.server.to(payload.room).emit('chatToClient', { room: payload.room, message: payload.message, sender: this.getUserIdFromSocket(client) });
    }

    /**
     * Handles the 'getChatHistory' message, allowing a user to retrieve chat history for a room.
     * @param client - The WebSocket client.
     * @param payload - The payload containing the room ID.
     */
    @SubscribeMessage('getChatHistory')
    async handleGetChatHistory(client: Socket, payload: { room: string }): Promise<void> {
        const userId = this.getUserIdFromSocket(client);

        if (!userId) {
            client.disconnect(true);
            return;
        }

        const room = await this.chatService.findRoomByUserAndRoomId(userId, payload.room);

        if (!room) {
            // Handle unauthorized access
            client.disconnect(true);
            return;
        }

        const chatHistory = await this.chatService.getChatHistory(payload.room);
        client.emit('chatHistory', { room: payload.room, history: chatHistory });
    }

    /**
     * Extracts the JWT token from the request headers.
     * @param headers - The request headers.
     * @returns The extracted JWT token or null if not found.
     */
    private extractTokenFromHeaders(headers: any): string | null {
        const authorizationHeader = headers.authorization || headers.Authorization;

        if (!authorizationHeader) {
            return null;
        }

        return authorizationHeader;
    }

    /**
     * Retrieves the user ID from the WebSocket client.
     * @param client - The WebSocket client.
     * @returns The user ID.
     */
    private getUserIdFromSocket(client: Socket): string {
        return client["user"];
    }
}
