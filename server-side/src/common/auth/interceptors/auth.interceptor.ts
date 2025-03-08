import {CallHandler, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException,} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {Reflector} from '@nestjs/core';
import {Observable} from 'rxjs';
import {AUTH_META_DATA} from "./auth.decorator";
import {AuthService} from "../services/auth.service";
import {TokenService} from "../services/token.service";

@Injectable()
export class AuthInterceptor implements NestInterceptor {

    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
        private authService: AuthService,
        private tokenService: TokenService
    ) {
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const isAuthRequired = this.reflector.get<boolean>(AUTH_META_DATA, context.getHandler());

        if (!isAuthRequired) {
            return next.handle();
        }

        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No token provided');
        }

        const token = authHeader.split(' ')[1];

        // Validate token
        const isValid = await this.tokenService.validateToken(token);

        // If token is invalid, throw an error
        if (!isValid) {
            throw new UnauthorizedException('Invalid token');
        }

        return next.handle();
    }
}