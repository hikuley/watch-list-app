import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Admin, Kafka } from 'kafkajs';
import { KafkaTopics } from '../../common/message/kafka.topics';

// Silence the partitioner warning
process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1';

@Injectable()
export class KafkaAdminService implements OnModuleInit {
  private readonly logger = new Logger(KafkaAdminService.name);
  private admin: Admin;

  constructor(private readonly configService: ConfigService) {
    const brokers = this.configService.get<string>('KAFKA_BROKERS')?.split(',') ?? ['localhost:9092'];
    
    this.logger.log(`Initializing Kafka admin with brokers: ${brokers.join(', ')}`);
    
    const kafka = new Kafka({
      clientId: 'nest-admin',
      brokers,
    });
    
    this.admin = kafka.admin();
  }

  async onModuleInit() {
    try {
      this.logger.log('Connecting to Kafka admin...');
      await this.admin.connect();
      this.logger.log('Connected to Kafka admin successfully');
      
      // Get all topics from KafkaTopics
      const topics = Object.values(KafkaTopics);
      this.logger.log(`Available topics in KafkaTopics: ${topics.join(', ')}`);
      
      // Get existing topics
      this.logger.log('Fetching existing topics from Kafka...');
      const existingTopics = await this.admin.listTopics();
      this.logger.log(`Existing topics in Kafka: ${existingTopics.join(', ') || 'none'}`);
      
      // Filter out topics that already exist
      const topicsToCreate = topics.filter(topic => !existingTopics.includes(topic));
      
      if (topicsToCreate.length > 0) {
        this.logger.log(`Creating ${topicsToCreate.length} Kafka topics: ${topicsToCreate.join(', ')}`);
        
        await this.admin.createTopics({
          topics: topicsToCreate.map(topic => ({
            topic,
            numPartitions: 1,
            replicationFactor: 1,
            configEntries: [{ name: 'retention.ms', value: '604800000' }] // 7 days retention
          })),
          timeout: 10000, // 10 seconds timeout
        });
        
        this.logger.log('Kafka topics created successfully');
        
        // Verify the topics were created
        const updatedTopics = await this.admin.listTopics();
        this.logger.log(`Updated topics in Kafka: ${updatedTopics.join(', ')}`);
        
        // Check if all topics were created
        const missingTopics = topicsToCreate.filter(topic => !updatedTopics.includes(topic));
        if (missingTopics.length > 0) {
          this.logger.warn(`Some topics were not created: ${missingTopics.join(', ')}`);
        } else {
          this.logger.log('All topics were created successfully');
        }
      } else {
        this.logger.log('All Kafka topics already exist');
      }
    } catch (error) {
      this.logger.error(`Failed to create Kafka topics: ${error.message}`, error.stack);
      // Re-throw to allow the command to catch it
      throw error;
    } finally {
      try {
        this.logger.log('Disconnecting from Kafka admin...');
        await this.admin.disconnect();
        this.logger.log('Disconnected from Kafka admin successfully');
      } catch (disconnectError) {
        this.logger.error(`Error disconnecting from Kafka admin: ${disconnectError.message}`);
      }
    }
  }

  async createTopic(topic: string, numPartitions = 1, replicationFactor = 1) {
    try {
      this.logger.log(`Creating topic '${topic}' with ${numPartitions} partition(s) and replication factor ${replicationFactor}`);
      await this.admin.connect();
      await this.admin.createTopics({
        topics: [
          {
            topic,
            numPartitions,
            replicationFactor,
          },
        ],
        timeout: 10000, // 10 seconds timeout
      });
      this.logger.log(`Topic '${topic}' created successfully`);
      
      // Verify the topic was created
      const topics = await this.admin.listTopics();
      if (topics.includes(topic)) {
        this.logger.log(`Verified topic '${topic}' exists`);
        return true;
      } else {
        this.logger.warn(`Topic '${topic}' was not found after creation attempt`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Failed to create topic '${topic}': ${error.message}`, error.stack);
      throw error;
    } finally {
      try {
        await this.admin.disconnect();
      } catch (disconnectError) {
        this.logger.error(`Error disconnecting from Kafka admin: ${disconnectError.message}`);
      }
    }
  }
} 