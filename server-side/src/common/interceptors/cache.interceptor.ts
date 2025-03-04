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

        const cacheKey = this.reflector.get(CACHE_KEY_METADATA, handler) || request.url;
        const ttl = this.reflector.get(CACHE_TTL_METADATA, handler) || 3600;

        if (!isGetRequest) {
            // For POST, PATCH, DELETE: invalidate related caches
            await this.invalidateCache();
            return next.handle();
        }

        // For GET requests: try to get from cache
        const cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            return of(cachedData);
        }

        // If not in cache, get from source and cache it
        return next.handle().pipe(
            tap(async (data: any) => {
                await this.cacheManager.set(cacheKey, data, ttl * 1000);
            }),
        );
    }

    private async invalidateCache(): Promise<void> {
        const redisCache = this.cacheManager as any;
        if (redisCache.store.client) {
            try {
                // Clear all movies-related caches
                const keys = await redisCache.store.client.keys('*movies*');
                if (keys.length > 0) {
                    await Promise.all([
                        this.cacheManager.del('all_movies'),
                        ...keys.map(key => this.cacheManager.del(key))
                    ]);
                }
            } catch (error) {
                console.error('Cache invalidation error:', error);
            }
        }
    }
}