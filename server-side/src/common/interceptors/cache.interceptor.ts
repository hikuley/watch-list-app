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
        const isGetRequest = request.method === 'GET';
        const handler = context.getHandler();
        const prefix = this.getResourcePrefix(request.path);

        const cacheKey = this.reflector.get(CACHE_KEY_METADATA, handler) || `${prefix}:${request.url}`;
        const ttl = this.reflector.get(CACHE_TTL_METADATA, handler) || 3600;

        if (!isGetRequest) {
            await this.invalidateCache(prefix);
            return next.handle();
        }

        const cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            return of(cachedData);
        }

        return next.handle().pipe(
            tap(async (data: any) => {
                await this.cacheManager.set(cacheKey, data, ttl * 1000);
            }),
        );
    }

    private getResourcePrefix(path: string): string {
        const resource = path.split('/')[1]; // Extract resource from path (e.g., 'movies' from '/movies/123')
        return resource || 'default';
    }

    private async invalidateCache(prefix: string): Promise<void> {
        const redisCache = this.cacheManager as any;
        if (redisCache.store.client) {
            try {
                const keys = await redisCache.store.client.keys(`*${prefix}*`);
                if (keys.length > 0) {
                    await Promise.all([
                        this.cacheManager.del(`${prefix}_all`),
                        ...keys.map(key => this.cacheManager.del(key))
                    ]);
                }
            } catch (error) {
                console.error('Cache invalidation error:', error);
            }
        }
    }
}