import {Module} from '@nestjs/common';
import {MoviesService} from './movies.service';
import {MoviesController} from './movies.controller';
import {DatabaseModule} from '../db/db.module';

@Module({
    imports: [DatabaseModule],
    controllers: [MoviesController],
    providers: [MoviesService],
    exports: [MoviesService],
})
export class MoviesModule {
}
