import {
    Controller,
    Post,
    Body,
    ValidationPipe, Get, Inject
} from '@nestjs/common';
import {AuthService} from './services/auth.service';
import {SignupDto} from './dto/signup.dto';
import {VerifyEmailDto} from './dto/verify-email.dto';
import {MessagePattern, Payload} from "@nestjs/microservices";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    async signup(@Body(new ValidationPipe()) signupDto: SignupDto) {
        return this.authService.signup(signupDto);
    }

    @Post('verify-email')
    async verifyEmail(@Body(new ValidationPipe()) verifyEmailDto: VerifyEmailDto) {
        return this.authService.verifyEmail(verifyEmailDto);
    }


    @Get('send-message')
    async sendMessage() {
        //await this.kafkaService.sendMessage('test-topic', {key: 'value'});
        return 'Message sent!';
    }

    @MessagePattern('test-topic')
    async handleKafkaMessage(@Payload() message: any) {
        console.log('Received message:', message);
    }

}