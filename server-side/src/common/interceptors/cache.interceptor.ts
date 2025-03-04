import {Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject} from '@nestjs/common';
import {Observable, of, tap} from 'rxjs';
import {CACHE_MANAGER} from '@nestjs/cache-manager';
import {Cache} from 'cache-manager';
import {Reflector} from '@nestjs/core';
import {CACHE_KEY_METADATA, CACHE_TTL_METADATA} from '../decorators/cache.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private reflector: Reflector,
    ) {
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        if (request.method !== 'GET') {
            await this.clearCache(request.path);
            return next.handle();
        }

        const key = this.reflector.get(CACHE_KEY_METADATA, context.getHandler()) || request.url;
        const ttl = this.reflector.get(CACHE_TTL_METADATA, context.getHandler()) || 3600;

        const cachedData = await this.cacheManager.get(key);
        if (cachedData) {
            return of(cachedData);
        }

        return next.handle().pipe(
            tap(async (data: any) => {
                await this.cacheManager.set(key, data, ttl * 1000);
            }),
        );
    }

    private async clearCache(path: string): Promise<void> {
        // Access Redis client directly for keys operation
        const redisCache = this.cacheManager as any;
        if (redisCache.store.client) {
            const keys = await redisCache.store.client.keys(`${path}*`);
            if (keys.length > 0) {
                await Promise.all(keys.map(key => this.cacheManager.del(key)));
            }
        }
    }
}