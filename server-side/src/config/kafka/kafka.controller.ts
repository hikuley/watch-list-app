import {Controller, Get} from "@nestjs/common";
import {KafkaService} from "./kafka.service";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {KafkaTopics} from "./kafka.topics";
import {EmailService} from "../../common/email/email.service";


@Controller('kafka')
class KafkaController {
    constructor(
        private readonly kafkaService: KafkaService,
        private readonly emailService: EmailService
    ) {
    }

    @Get('test-send-message')
    async sendMessage() {
        await this.kafkaService.sendMessage(KafkaTopics.TEST_TOPIC_TEST, {key: 'value'});
        return 'Message sent!';
    }

    @MessagePattern(KafkaTopics.TEST_TOPIC_TEST)
    async handleKafkaMessage(@Payload() message: any) {
        console.log('Received message TEST:', message);
    }

    @MessagePattern(KafkaTopics.SEND_VERIFICATION_EMAIL)
    async handleSendVerificationEmail(@Payload() message: any) {
        console.log('Received message:', message);

        await this.emailService.sendMail(
            message.email,
            'Email Verification',
            `Your verification code is: ${message.verificationCode}`
        );
    }

}

export default KafkaController;