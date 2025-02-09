export type CommandSender = <Name extends string, Input = any, Output = any>(command: CommandEvent<Input, Name>) => Promise<Output>;
export type CommandReceiver<Input, Output, Type> = (payload?: Input, name?: Type) => Promise<Output>;
export type Command<Input, Output, Type extends string> = { type: Type; receiver: CommandReceiver<Input, Output, Type>;}
export type CommandEvent<Input, Name extends string> = { type: Name; payload?: Input; }

export const BridgeSendCommandEvent = 'sendCommand';
export type BridgeSendCommandEventType = 'sendCommand';

export * from './adb';
export * from './adb/androidToolsSetup';
export * from './games';
export * from './settings';
export * from './settings/devTools';

const All = {}
export default All;