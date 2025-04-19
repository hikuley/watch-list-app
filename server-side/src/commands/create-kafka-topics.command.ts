import { Command, CommandRunner } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { KafkaAdminService } from '../config/kafka/kafka-admin.service';
import { KafkaTopics } from '../common/message/kafka.topics';

@Command({ name: 'create-kafka-topics', description: 'Create Kafka topics' })
export class CreateKafkaTopicsCommand extends CommandRunner {
  private readonly logger = new Logger(CreateKafkaTopicsCommand.name);

  constructor(private readonly kafkaAdminService: KafkaAdminService) {
    super();
  }

  async run(): Promise<void> {
    try {
      this.logger.log('Creating Kafka topics...');
      
      // Log the topics that we're going to create
      this.logger.log(`Topics to be created: ${Object.values(KafkaTopics).join(', ')}`);
      
      // This will trigger the onModuleInit method in KafkaAdminService
      await this.kafkaAdminService.onModuleInit();
      
      this.logger.log('Finished creating Kafka topics');
    } catch (error) {
      this.logger.error(`Failed to create Kafka topics: ${error.message}`, error.stack);
    }
  }
} 