import {Module} from '@nestjs/common';
import {AuthService} from './services/auth.service';
import {AuthController} from './auth.controller';
import {DatabaseModule} from '../../config/database/database.module';
import {PasswordService} from './services/password.service';
import {KafkaModule} from "../../config/kafka/kafka.module";

@Module({
    imports: [DatabaseModule, KafkaModule],
    controllers: [AuthController],
    providers: [AuthService, PasswordService],
})
export class AuthModule {
}