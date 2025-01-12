import { CommandEvent } from '../electron/shared';
export * from '../electron/shared';

export default async function sendCommand<Name extends string, Input = any, Output = any>(command: CommandEvent<Input, Name>): Promise<Output> {
  return window.sendCommand(command);
}
