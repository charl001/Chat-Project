import { Injectable, ExecutionContext, CanActivate, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    /**
     * Determines whether the current request is authorized.
     * @param context - The execution context.
     * @returns A boolean indicating whether the request is authorized.
     * @throws UnauthorizedException if the request is not authorized.
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: any = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            const payload = await this.jwtService.verify(token);
            request.body.user = payload.userId;
        } catch {
            throw new UnauthorizedException();
        }

        return true;
    }

    /**
     * Extracts the JWT token from the request headers.
     * @param request - The HTTP request.
     * @returns The extracted JWT token or undefined if not found.
     */
    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
