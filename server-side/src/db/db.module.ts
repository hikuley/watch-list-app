import {Module, Global} from '@nestjs/common';
import {db} from "./index";


@Global()
@Module({
    providers: [
        {
            provide: 'DRIZZLE',
            useValue: db,
        },
    ],
    exports: ['DRIZZLE'],
})
export class DrizzleModule {
}