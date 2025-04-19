import {Module} from '@nestjs/common';
import {ClientsModule, Transport} from '@nestjs/microservices';
import {KafkaProducer} from '../../common/message/kafka.producer';
import KafkaConsumer from "../../common/message/kafka.consumer";
import {EmailService} from "../../common/email/email.service";
import {ConfigModule, ConfigService} from '@nestjs/config';
import {KafkaAdminService} from './kafka-admin.service';

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
                            brokers: configService.get<string>('KAFKA_BROKERS')?.split(',') ?? ['localhost:9092'],
                        },
                        consumer: {
                            groupId: configService.get<string>('KAFKA_CONSUMER_GROUP_ID') ?? 'default-group',
                        },
                        producer: {
                            allowAutoTopicCreation: true,
                        },
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    providers: [KafkaProducer, EmailService, KafkaAdminService],
    exports: [KafkaProducer, KafkaAdminService],
    controllers: [KafkaConsumer],
})
export class KafkaModule {
}