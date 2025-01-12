import React from "react";
import { Device } from "../../electron/comands/adb/types";
import { formatSize } from "./GameCard";

const DeviceInfoCard: React.FC<{ deviceInfo: Device }> = ({ deviceInfo }) => {
  return (
    <div className="device-info">
      <h2>Device Info</h2>
      <ul>
        <li><strong>Serial:</strong> {deviceInfo.serial}</li>
        <li><strong>Model:</strong> {deviceInfo.model}</li>
        <li><strong>IP:</strong> {deviceInfo.ip}</li>
        <li><strong>Android Version:</strong> {deviceInfo.androidVersion}</li>
        <li><strong>SDK Version:</strong> {deviceInfo.sdkVersion}</li>
        <li><strong>Battery Level:</strong> {deviceInfo.batteryLevel}%</li>
        <li>
          <strong>Space Usage:</strong>
          <ul>
            <li>Total: {formatSize(deviceInfo.spaceUsage?.total)} bytes</li>
            <li>Free: {formatSize(deviceInfo.spaceUsage?.free)} bytes</li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default DeviceInfoCard;