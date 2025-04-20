import { Command, CommandRunner, Option } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { KafkaAdminService } from '../config/kafka/kafka-admin.service';
import { KafkaTopics } from '../common/message/kafka.topics';

interface SyncCommandOptions {
  dryRun?: boolean;
  skipDelete?: boolean;
}

@Command({ name: 'sync-kafka-topics', description: 'Synchronize Kafka topics with KafkaTopics definition' })
export class SyncKafkaTopicsCommand extends CommandRunner {
  private readonly logger = new Logger(SyncKafkaTopicsCommand.name);

  constructor(private readonly kafkaAdminService: KafkaAdminService) {
    super();
  }

  @Option({
    flags: '-d, --dry-run [boolean]',
    description: 'Show what would be done without actually making changes',
  })
  parseDryRun(val: string): boolean {
    return val === 'true';
  }

  @Option({
    flags: '-s, --skip-delete [boolean]',
    description: 'Skip deleting redundant topics',
  })
  parseSkipDelete(val: string): boolean {
    return val === 'true';
  }

  async run(
    passedParams: string[],
    options?: SyncCommandOptions,
  ): Promise<void> {
    try {
      this.logger.log('Synchronizing Kafka topics...');
      
      // Log the topics in KafkaTopics
      this.logger.log(`Topics defined in KafkaTopics: ${Object.values(KafkaTopics).join(', ')}`);
      
      const dryRun = options?.dryRun || false;
      const skipDelete = options?.skipDelete || false;
      
      if (dryRun) {
        this.logger.log('Running in dry-run mode - no changes will be made');
      }
      
      if (skipDelete) {
        this.logger.log('Skip-delete mode enabled - redundant topics will not be deleted');
      }
      
      if (dryRun) {
        // Perform a dry run by getting the topics without making changes
        const dryRunResult = await this.kafkaAdminService.dryRunSync(!skipDelete);
        
        this.logger.log(`Would create ${dryRunResult.toCreate.length} topics: ${dryRunResult.toCreate.length > 0 ? dryRunResult.toCreate.join(', ') : 'none'}`);
        this.logger.log(`Would delete ${dryRunResult.toDelete.length} topics: ${dryRunResult.toDelete.length > 0 ? dryRunResult.toDelete.join(', ') : 'none'}`);
      } else {
        // Perform the actual synchronization
        const result = await this.kafkaAdminService.synchronizeTopics(!skipDelete);
        
        this.logger.log('Kafka topics synchronization completed');
        this.logger.log(`Created topics: ${result.created.length > 0 ? result.created.join(', ') : 'none'}`);
        this.logger.log(`Deleted topics: ${result.deleted.length > 0 ? result.deleted.join(', ') : 'none'}`);
      }
    } catch (error) {
      this.logger.error(`Failed to synchronize Kafka topics: ${error.message}`, error.stack);
    }
  }
} 