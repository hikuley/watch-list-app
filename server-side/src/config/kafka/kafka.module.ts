import {Module} from '@nestjs/common';
import {ClientsModule, Transport} from '@nestjs/microservices';
import {KafkaService} from '../../common/message/kafka.service';
import KafkaConsumer from "../../common/message/kafka.consumer";
import {EmailService} from "../../common/email/email.service";
import {ConfigModule, ConfigService} from '@nestjs/config';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'KAFKA_SERVICE',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.KAFKA,
                    options: {
                        client: {
                            brokers: configService.get<string>('KAFKA_BROKERS', 'localhost:9092').split(','),
                        },
                        consumer: {
                            groupId: configService.get<string>('KAFKA_CONSUMER_GROUP_ID', 'my-consumer-group'),
                        },
                        producer: {
                            allowAutoTopicCreation: true,
                        }
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    providers: [KafkaService, EmailService],
    exports: [KafkaService],
    controllers: [KafkaConsumer],
})
export class KafkaModule {
}