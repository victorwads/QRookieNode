import React from "react";

import { Device } from "@bridge/devices";
import Button from "./Button";
import { Icons } from "./Icons";

interface DeviceListProps {
  devices: Device[];
  onConnect: (serial: string) => void;
  onConnectWifi: (serial: string) => void;
}

const DevicesList: React.FC<DeviceListProps> = ({ devices, onConnect, onConnectWifi }) => {
  return (
    <div className="devices-list">
      <h2>Devices</h2>
      <ul>
        {devices.map(device => (
          <li key={device.serial}>
            <strong>Serial:</strong> {device.serial} - <strong>Model:</strong>{" "}
            {device.model || "Unknown"}
            <Button onClick={() => onConnect(device.serial)} icon={Icons.solid.faLink}>
              Connect
            </Button>
            {device.ip && !device.serial.includes(device.ip) && (
              <Button onClick={() => onConnectWifi(device.serial)} icon={Icons.solid.faWifi}>
                Network Connect
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DevicesList;
