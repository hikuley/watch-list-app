import {Module} from '@nestjs/common';
import {DrizzleModule} from './db/db.module';
import {MoviesModule} from './movies/movies.module';

@Module({
    imports: [
        DrizzleModule,
        MoviesModule,
    ],
})
export class AppModule {
}
