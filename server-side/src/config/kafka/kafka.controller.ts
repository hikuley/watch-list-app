import {Controller, Get} from "@nestjs/common";
import {KafkaService} from "./kafka.service";
import {MessagePattern, Payload} from "@nestjs/microservices";


@Controller('kafka')
class KafkaController {
    constructor(private readonly kafkaService: KafkaService) {
    }

    @Get('test-send-message')
    async sendMessage() {
        await this.kafkaService.sendMessage('test-topic-test', {key: 'value'});
        return 'Message sent!';
    }

    @MessagePattern('test-topic-test')
    async handleKafkaMessage(@Payload() message: any) {
        console.log('Received message:', message);
    }

}

export default KafkaController;