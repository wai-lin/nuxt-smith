import { runCommands } from './cli/cmd';
import init from './commands/init';

export default () => runCommands([init])
