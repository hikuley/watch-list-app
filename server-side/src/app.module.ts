import {Module} from '@nestjs/common';
import {DatabaseModule} from './database/database.module';
import {MoviesModule} from './movies/movies.module';
import {AuthModule} from "./auth/auth.module";
import {RedisCacheModule} from "./config/redis.config";

@Module({
    imports: [
        DatabaseModule,
        RedisCacheModule,
        MoviesModule,
        AuthModule,
    ],
})
export class AppModule {
}
