import {Body, Controller, Post, ValidationPipe} from '@nestjs/common';
import {AuthService} from './services/auth.service';
import {SignupDto} from './dto/signup.dto';
import {VerifyEmailDto} from './dto/verify-email.dto';
import {KafkaService} from "../../config/kafka/kafka.service";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly kafkaService: KafkaService
    ) {
    }

    @Post('signup')
    async signup(@Body(new ValidationPipe()) signupDto: SignupDto) {
        return this.authService.signup(signupDto);
    }

    @Post('verify-email')
    async verifyEmail(@Body(new ValidationPipe()) verifyEmailDto: VerifyEmailDto) {
        return this.authService.verifyEmail(verifyEmailDto);
    }

}