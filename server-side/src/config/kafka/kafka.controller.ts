import {Controller, Get} from "@nestjs/common";
import {KafkaService} from "./kafka.service";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {KafkaTopics} from "./kafka.topics";


@Controller('kafka')
class KafkaController {
    constructor(private readonly kafkaService: KafkaService) {
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

}

export default KafkaController;