import {Module} from '@nestjs/common';
import {DatabaseModule} from './config/database/database.module';

import {RedisCacheModule} from "./config/redis/redis.config";
import {MoviesModule} from "./domain/movies/movies.module";
import {AuthModule} from "./domain/auth/auth.module";
import {KafkaModule} from "./config/kafka/kafka.module";
import {EmailModule} from "./common/email/email.module";

@Module({
    imports: [
        DatabaseModule,
        RedisCacheModule,
        EmailModule,
        KafkaModule,
        MoviesModule,
        AuthModule,
    ],
})
export class AppModule {
}
