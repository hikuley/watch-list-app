import {Module} from '@nestjs/common';
import {DatabaseModule} from './config/database/database.module';

import {RedisCacheModule} from "./config/redis/redis.config";
import {MoviesModule} from "./domain/movies/movies.module";
import {CommentsModule} from "./domain/comments/comments.module";
import {AuthModule} from "./common/auth/auth.module";
import {KafkaModule} from "./config/kafka/kafka.module";
import {EmailModule} from "./common/email/email.module";
import {ConfigModule} from "@nestjs/config";
import {APP_INTERCEPTOR} from "@nestjs/core";
import {AuthInterceptor} from "./common/auth/interceptors/auth.interceptor";
import {JwtModule} from "@nestjs/jwt";


@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true,
        }),
        DatabaseModule,
        RedisCacheModule,
        EmailModule,
        KafkaModule,
        MoviesModule,
        CommentsModule,
        AuthModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-secret-key', // Use environment variables in production
            signOptions: {expiresIn: '24h'},
        }),
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: AuthInterceptor,
        },
    ],
})
export class AppModule {
}
