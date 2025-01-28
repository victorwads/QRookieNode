export type CommandSender = <Input, Output, Name extends string>(command: CommandEvent<Input, Name>) => Output;
export type CommandReceiver<Input, Output, Type> = (payload?: Input, name?: Type) => Promise<Output>;
export type Command<Input, Output, Type extends string> = { type: Type; receiver: CommandReceiver<Input, Output, Type>;}
export type CommandEvent<Input, Name extends string> = { type: Name; payload?: Input; }

export const BridgeSendCommandEvent = 'sendCommand';
export type BridgeSendCommandEventType = 'sendCommand';

export * from '../comands/adb';
export * from '../comands/adb/androidToolsSetup';
export * from '../comands/devTools';
export * from '../comands/games';

const All = {}
export default All;

declare global {
    interface Window {
        sendCommand: CommandSender;
    }
}