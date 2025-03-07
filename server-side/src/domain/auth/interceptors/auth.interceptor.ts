import {CallHandler, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException,} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {Reflector} from '@nestjs/core';
import {Observable} from 'rxjs';
import {AUTH_META_DATA} from "./auth.decorator";

@Injectable()
export class AuthInterceptor implements NestInterceptor {

    constructor(private jwtService: JwtService, private reflector: Reflector) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
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

        try {
            const payload = this.jwtService.verify(token);
            request.user = payload; // Attach decoded user info to request
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }

        return next.handle();
    }
}