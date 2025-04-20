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
  
  // List of system topics that should never be deleted
  private readonly systemTopics = ['__consumer_offsets'];

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
      this.logger.log('Initializing Kafka topics synchronization on application startup...');
      
      // Check if auto-sync is enabled (default to true)
      const enableAutoSync = this.configService.get<string>('KAFKA_AUTO_SYNC_TOPICS') !== 'false';
      
      if (enableAutoSync) {
        // Get whether to delete redundant topics (default to false for safety on startup)
        const deleteRedundantOnStartup = this.configService.get<string>('KAFKA_DELETE_REDUNDANT_ON_STARTUP') === 'true';
        
        if (deleteRedundantOnStartup) {
          this.logger.log('Running full synchronization (create missing topics and delete redundant ones)');
        } else {
          this.logger.log('Running partial synchronization (only creating missing topics)');
        }
        
        // Run synchronization with the appropriate delete flag
        const result = await this.synchronizeTopics(deleteRedundantOnStartup);
        
        this.logger.log('Kafka topics synchronization on startup completed');
        this.logger.log(`Created topics: ${result.created.length > 0 ? result.created.join(', ') : 'none'}`);
        
        if (deleteRedundantOnStartup) {
          this.logger.log(`Deleted topics: ${result.deleted.length > 0 ? result.deleted.join(', ') : 'none'}`);
        }
      } else {
        this.logger.log('Automatic Kafka topic synchronization is disabled');
      }
    } catch (error) {
      this.logger.error(`Failed to synchronize Kafka topics on startup: ${error.message}`, error.stack);
      // We don't rethrow to prevent application startup failure due to Kafka issues
    }
  }

  /**
   * Synchronize Kafka topics by creating missing topics and removing redundant ones
   * 
   * @param deleteUnused - Whether to delete topics that don't exist in KafkaTopics (default: true)
   * @returns Object containing created and deleted topics
   */
  async synchronizeTopics(deleteUnused = true): Promise<{ created: string[], deleted: string[] }> {
    const result: { created: string[], deleted: string[] } = { created: [], deleted: [] };
    
    try {
      this.logger.log('Starting Kafka topics synchronization...');
      await this.admin.connect();
      
      // Get defined topics from KafkaTopics
      const definedTopics = Object.values(KafkaTopics);
      this.logger.log(`Defined topics in KafkaTopics: ${definedTopics.join(', ')}`);
      
      // Get existing topics from Kafka
      const existingTopics = await this.admin.listTopics();
      this.logger.log(`Existing topics in Kafka: ${existingTopics.join(', ') || 'none'}`);
      
      // Find topics to create (defined but don't exist in Kafka)
      const topicsToCreate = definedTopics.filter(topic => !existingTopics.includes(topic));
      
      // Find topics to delete (exist in Kafka but not defined in KafkaTopics)
      // Skip system topics that should never be deleted
      const topicsToDelete = deleteUnused ? 
        existingTopics.filter(topic => 
          !definedTopics.includes(topic) && 
          !this.systemTopics.includes(topic)
        ) : [];
      
      // Create missing topics
      if (topicsToCreate.length > 0) {
        this.logger.log(`Creating ${topicsToCreate.length} missing topics: ${topicsToCreate.join(', ')}`);
        
        await this.admin.createTopics({
          topics: topicsToCreate.map(topic => ({
            topic,
            numPartitions: 1,
            replicationFactor: 1,
            configEntries: [{ name: 'retention.ms', value: '604800000' }] // 7 days retention
          })),
          timeout: 10000,
        });
        
        result.created = topicsToCreate;
        this.logger.log(`Created ${topicsToCreate.length} topics successfully`);
      } else {
        this.logger.log('No missing topics to create');
      }
      
      // Delete redundant topics
      if (topicsToDelete.length > 0 && deleteUnused) {
        this.logger.log(`Deleting ${topicsToDelete.length} redundant topics: ${topicsToDelete.join(', ')}`);
        
        await this.admin.deleteTopics({
          topics: topicsToDelete,
          timeout: 10000,
        });
        
        result.deleted = topicsToDelete;
        this.logger.log(`Deleted ${topicsToDelete.length} topics successfully`);
      } else {
        this.logger.log('No redundant topics to delete');
      }
      
      // Verify the final state
      const finalTopics = await this.admin.listTopics();
      this.logger.log(`Final topics in Kafka after synchronization: ${finalTopics.join(', ')}`);
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to synchronize Kafka topics: ${error.message}`, error.stack);
      throw error;
    } finally {
      try {
        await this.admin.disconnect();
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

  /**
   * Get existing topics from Kafka
   * Used for dry runs and other read-only operations
   */
  async getExistingTopics(): Promise<string[]> {
    try {
      await this.admin.connect();
      const topics = await this.admin.listTopics();
      return topics;
    } finally {
      await this.admin.disconnect();
    }
  }

  /**
   * Perform dry run of topic synchronization
   * @param deleteUnused Whether to include deletion of unused topics in the dry run
   * @returns Object with topics that would be created and deleted
   */
  async dryRunSync(deleteUnused = true): Promise<{ toCreate: string[], toDelete: string[] }> {
    try {
      await this.admin.connect();
      
      // Get defined topics from KafkaTopics
      const definedTopics = Object.values(KafkaTopics);
      
      // Get existing topics from Kafka
      const existingTopics = await this.admin.listTopics();
      
      // Find topics to create (defined but don't exist in Kafka)
      const topicsToCreate = definedTopics.filter(topic => !existingTopics.includes(topic));
      
      // Find topics to delete (exist in Kafka but not defined in KafkaTopics)
      // Skip system topics that should never be deleted
      const topicsToDelete = deleteUnused ? 
        existingTopics.filter(topic => 
          !definedTopics.includes(topic) && 
          !this.systemTopics.includes(topic)
        ) : [];
      
      return { 
        toCreate: topicsToCreate,
        toDelete: topicsToDelete
      };
    } finally {
      await this.admin.disconnect();
    }
  }
} 