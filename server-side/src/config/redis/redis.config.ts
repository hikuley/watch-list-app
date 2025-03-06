import {CacheModule} from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import {Global, Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';

@Global()
@Module({
    imports: [
        CacheModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                store: redisStore,
                socket: {
                    host: configService.get<string>('REDIS_HOST'),
                    port: configService.get<number>('REDIS_PORT'),
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