import {Injectable} from '@nestjs/common';
import {MessagePattern, Payload} from '@nestjs/microservices';

@Injectable()
export class EmailConsumerService {
    @MessagePattern('send_verification_email')
    async handleVerificationEmail(@Payload() data: { email: string; verificationCode: string }) {
        // Email sending logic, implement sending email logic.
        console.log('Sending verification email to', data.email);
        console.log('Verification code:', data.verificationCode);
    }
}