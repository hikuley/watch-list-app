import {Module} from '@nestjs/common';
import {ClientsModule, Transport} from '@nestjs/microservices';
import {KafkaService} from './kafka.service';
import KafkaController from "./kafka.controller";
import {KAFKA_CONFIG} from "./kafka.config";


@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'KAFKA_SERVICE',
                transport: Transport.KAFKA,
                options: {
                    client: {
                        brokers: KAFKA_CONFIG.BROKERS,
                    },
                    consumer: {
                        groupId: KAFKA_CONFIG.CONSUMER_GROUP_ID,
                    },
                    producer: {
                        allowAutoTopicCreation: true,
                    }
                },
            },
        ]),
    ],
    providers: [KafkaService],
    exports: [KafkaService],
    controllers: [KafkaController],
})
export class KafkaModule {
}