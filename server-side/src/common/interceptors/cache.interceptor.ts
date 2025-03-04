import {Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject} from '@nestjs/common';
import {Observable, of, tap} from 'rxjs';
import {CACHE_MANAGER} from '@nestjs/cache-manager';
import {Cache} from 'cache-manager';
import {Reflector} from '@nestjs/core';
import {CACHE_EVICT_METADATA, CACHE_KEY_METADATA, CACHE_TTL_METADATA} from '../decorators/cache.decorator';

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

        if (!isGetRequest) {
            const evictKey = this.reflector.get(CACHE_EVICT_METADATA, handler);
            if (evictKey) {
                await this.invalidateCache(evictKey, request.params.id);
            }
            return next.handle();
        }

        const cacheKey = this.getCacheKey(handler, request);
        const ttl = this.reflector.get(CACHE_TTL_METADATA, handler) || 3600;

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

    private getCacheKey(handler: any, request: any): string {
        const key = this.reflector.get(CACHE_KEY_METADATA, handler);
        if (!key) return request.url;
        return request.params.id ? key.replace(':id', request.params.id) : key;
    }

    private async invalidateCache(key: string, id?: string): Promise<void> {
        try {
            if (key.includes(':id') && id) {
                // If key contains :id pattern and we have an ID, invalidate specific key
                const specificKey = key.replace(':id', id);
                await this.cacheManager.del(specificKey);
            } else {
                // Otherwise invalidate the exact key
                await this.cacheManager.del(key);
            }
        } catch (error) {
            console.error('Cache invalidation error:', error);
        }
    }
}