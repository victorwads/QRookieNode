import React from "react";

import type { Device } from "@bridge/devices";
import { formatSize } from "./GameCard";

function calculateColor(value: number, max: number, isReversed: boolean = false): string {
  const percentage = Math.max(0, Math.min(value / max, 1)); // Limits between 0 and 1
  const red = isReversed ? percentage * 255 : (1 - percentage) * 255;
  const green = isReversed ? (1 - percentage) * 255 : percentage * 255;

  return `rgb(${Math.round(red)}, ${Math.round(green)}, 0)`;
}

const DeviceInfoCard: React.FC<{ deviceInfo: Device }> = ({ deviceInfo }) => {
  const total = (deviceInfo.spaceUsage?.total || 0) * 1000;
  const used = (deviceInfo.spaceUsage?.used || 0) * 1000;
  return (
    <div className="device-info">
      <h2>Selected Device Info</h2>
      <ul>
        <li>
          <strong>Serial:</strong> {deviceInfo.serial}
        </li>
        <li>
          <strong>Model:</strong> {deviceInfo.model}
        </li>
        <li>
          <strong>IP:</strong> {deviceInfo.ip}
        </li>
        <li>
          <strong>Android Version:</strong> {deviceInfo.androidVersion}
        </li>
        <li>
          <strong>SDK Version:</strong> {deviceInfo.sdkVersion}
        </li>
        <li>
          <strong>Storage:</strong> {formatSize(total)}
          <div>
            <ProgressBar value={used} max={total} isReversed />
          </div>
          <ul>
            <li>
              <strong>Used:</strong> {formatSize(used)} -- {((used / total) * 100).toFixed(2)}%
            </li>
            <li>
              <strong>Free:</strong> {formatSize(total - used)} --{" "}
              {(((total - used) / total) * 100).toFixed(2)}%
            </li>
          </ul>
        </li>
        <li>
          <strong>Battery Level:</strong> {deviceInfo.batteryLevel}%
          <div>
            <ProgressBar value={deviceInfo.batteryLevel || 0} max={100} />
          </div>
        </li>
      </ul>
    </div>
  );
};

interface ProgressBarProps {
  value: number;
  max: number;
  isReversed?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, isReversed = false }) => {
  const color = calculateColor(value, max, isReversed);
  const uniq = `progress-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <>
      <progress
        className={uniq}
        value={value}
        max={max}
        style={{
          borderRadius: "10px",
          overflow: "hidden",
          backgroundColor: "#ddd",
          height: "10px",
          border: "none",
        }}
      ></progress>
      <style>
        {`
          progress.${uniq}::-webkit-progress-bar {
            background-color: #ddd;
            overflow: hidden;
          }

          progress.${uniq}::-webkit-progress-value {
            background-color: ${color};
          }
        `}
      </style>
    </>
  );
};
export default DeviceInfoCard;
