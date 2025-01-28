import type { CommandEvent } from '../../electron/shared';

async function sendCommand<Name extends string, Input = any, Output = any>(command: CommandEvent<Input, Name>): Promise<Output> {
  return window.sendCommand(command);
}

export default sendCommand;
