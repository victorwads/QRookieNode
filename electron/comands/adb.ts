import { Command, CommandEvent } from "../shared";

interface AdbPayload {}

export type AdbCommand = Command<AdbPayload, string, 'adb'>;    
export type AdbCommandEvent = CommandEvent<AdbPayload, 'devTools'>

export default {
    type: 'adb',
    receiver: async function (payload) {
        return "Not implemented";
    } 
} as AdbCommand;