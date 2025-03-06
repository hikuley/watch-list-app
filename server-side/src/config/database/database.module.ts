import {Global, Module} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import {Pool} from "pg";
import {drizzle} from "drizzle-orm/node-postgres";
import * as schema from './schema';


@Global()
@Module({
    providers: [
        {
            provide: 'DB_INSTANCE',
            useFactory: async (configService: ConfigService) => {
                const pool = new Pool({
                    host: configService.get<string>('DB_HOST'),
                    port: configService.get<number>('DB_PORT'),
                    user: configService.get<string>('DB_USER'),
                    password: configService.get<string>('DB_PASSWORD'),
                    database: configService.get<string>('DB_NAME'),
                });
                return drizzle(pool, {schema});
            },
            inject: [ConfigService],
        },
    ],
    exports: ['DB_INSTANCE'],
})
export class DatabaseModule {
}