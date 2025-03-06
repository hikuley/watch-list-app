import {Module} from '@nestjs/common';
import {AuthService} from './services/auth.service';
import {AuthController} from './auth.controller';
import {DatabaseModule} from '../../config/database/database.module';
import {PasswordService} from './services/password.service';
import {KafkaModule} from "../../config/kafka/kafka.module";
import {EmailModule} from "../../common/email/email.module";
import {JwtModule} from "@nestjs/jwt";

@Module({
    imports: [
        DatabaseModule,
        KafkaModule,
        EmailModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-secret-key', // Use environment variables in production
            signOptions: { expiresIn: '24h' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, PasswordService],
})
export class AuthModule {
}