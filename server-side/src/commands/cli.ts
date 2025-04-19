import { CommandFactory } from 'nest-commander';
import { CommandsModule } from './commands.module';

async function bootstrap() {
  // Use 'debug', 'log', 'warn', 'error' log levels for more verbose output
  await CommandFactory.run(CommandsModule, ['debug', 'log', 'warn', 'error']);
}

bootstrap(); 