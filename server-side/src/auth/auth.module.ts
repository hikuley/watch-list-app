import {Module} from '@nestjs/common';
import {AuthService} from './services/auth.service';
import {AuthController} from './auth.controller';
import {DrizzleModule} from '../db/db.module';
import {PasswordService} from './services/password.service';

@Module({
    imports: [DrizzleModule],
    controllers: [AuthController],
    providers: [AuthService, PasswordService],
})
export class AuthModule {
}