import {CacheModule} from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import {Global, Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';

@Global()
@Module({
    imports: [
        CacheModule.registerAsync({
            imports: [ConfigModule],
            useFactory: () => ({
                store: redisStore,
                socket: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379'),
                },
                ttl: 60 * 60,
            }),
            inject: [ConfigService],
        }),
    ],
    exports: [CacheModule],
})
export class RedisCacheModule {
}