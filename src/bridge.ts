import { CommandEvent } from '../electron/shared';
export * from '../electron/shared';
export type { DevToolsCommandEvent } from '../electron/comands/devTools';

export default async function sendCommand<Input, Output, Name extends string>(command: CommandEvent<Input, Name>): Promise<Output> {
    return window.sendCommand(command);
}