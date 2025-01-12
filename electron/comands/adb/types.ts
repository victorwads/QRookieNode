export interface Device {
    serial: string;
    model: string;
    ip?: string;
    batteryLevel?: number;
    androidVersion?: string;
    sdkVersion?: number;
    spaceUsage?: {
        total: number;
        used: number;
    };
}

export interface User {
    id: number;
    name: string;
    running: boolean;
    installedApps?: number;
}

export interface AppInfo {
    packageName: string;
    versionCode: number;
}

export interface AdbCommand {
    command: string;
    args?: string[];
}