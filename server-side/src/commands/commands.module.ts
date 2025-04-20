import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CreateKafkaTopicsCommand } from './create-kafka-topics.command';
import { SyncKafkaTopicsCommand } from './sync-kafka-topics.command';
import { KafkaModule } from '../config/kafka/kafka.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env' : 'local.env',
    }),
    KafkaModule,
  ],
  providers: [CreateKafkaTopicsCommand, SyncKafkaTopicsCommand],
})
export class CommandsModule {} 