import {Module} from '@nestjs/common';
import {MoviesService} from './movies.service';
import {MoviesController} from './movies.controller';
import {DrizzleModule} from '../db/db.module';
import {RedisCacheModule} from "../config/redis.config";

@Module({
    imports: [DrizzleModule, RedisCacheModule],
    controllers: [MoviesController],
    providers: [MoviesService],
    exports: [MoviesService],
})
export class MoviesModule {
}
