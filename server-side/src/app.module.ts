import {Module} from '@nestjs/common';
import {DrizzleModule} from './db/db.module';
import {MoviesModule} from './movies/movies.module';
import {AuthModule} from "./auth/auth.module";
import {RedisCacheModule} from "./config/redis.config";

@Module({
    imports: [
        DrizzleModule,
        MoviesModule,
        AuthModule,
        RedisCacheModule,
    ],
})
export class AppModule {
}
