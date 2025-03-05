import {Module, Global} from '@nestjs/common';
import {db} from "./index";


@Global()
@Module({
    providers: [
        {
            provide: 'DB_INSTANCE',
            useValue: db,
        },
    ],
    exports: ['DB_INSTANCE'],
})
export class DatabaseModule {
}