export type CommandSender = <Input, Output, Name extends string>(command: CommandEvent<Input, Name>) => Output;
export type CommandReceiver<Input, Output, Type> = (payload?: Input, name?: Type) => Promise<Output>;
export interface Command<Input, Output, Type extends string> { type: Type; receiver: CommandReceiver<Input, Output, Type>;}
export type CommandEvent<Input, Name extends string> = { type: Name; payload?: Input; }

export const BridgeSendCommandEvent = 'sendCommand';
export type BridgeSendCommandEventType = 'sendCommand';

export type { AdbCommandName, AdbPayload } from '../comands/adb';
export type { DevToolsCommandName  } from '../comands/devTools';

declare global {
    interface Window {
        sendCommand: CommandSender;
    }
}