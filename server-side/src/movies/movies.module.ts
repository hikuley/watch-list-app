import {Module} from '@nestjs/common';
import {MoviesService} from './movies.service';
import {MoviesController} from './movies.controller';
import {DrizzleModule} from '../db/db.module';

@Module({
    imports: [DrizzleModule],
    controllers: [MoviesController],
    providers: [MoviesService],
    exports: [MoviesService],
})
export class MoviesModule {
}
