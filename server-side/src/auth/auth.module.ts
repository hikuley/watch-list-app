import {Module} from '@nestjs/common';
import {AuthService} from './services/auth.service';
import {AuthController} from './auth.controller';
import {DatabaseModule} from '../database/database.module';
import {PasswordService} from './services/password.service';

@Module({
    imports: [DatabaseModule],
    controllers: [AuthController],
    providers: [AuthService, PasswordService],
})
export class AuthModule {
}