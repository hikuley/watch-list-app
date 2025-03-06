import {Module} from '@nestjs/common';
import {ClientsModule, Transport} from '@nestjs/microservices';
import {KafkaService} from './kafka.service';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'KAFKA_SERVICE',
                transport: Transport.KAFKA,
                options: {
                    client: {
                        brokers: [(process.env.KAFKA_BROKERS || 'localhost:9092')],
                    },
                    consumer: {
                        groupId: process.env.KAFKA_CONSUMER_GROUP_ID || 'my-consumer-group',
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
})
export class KafkaModule {
}