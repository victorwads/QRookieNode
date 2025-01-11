export interface DeviceManager {
    listDevices(): Promise<string[]>;
    connectToDevice(deviceId: string): Promise<boolean>;
    disconnectDevice(deviceId: string): Promise<boolean>;
}