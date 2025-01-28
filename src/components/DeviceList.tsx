import React from "react";
import { Device } from "../bridge/devices";

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
        {devices.map((device) => (
          <li key={device.serial}>
            <strong>Serial:</strong> {device.serial} - <strong>Model:</strong> {device.model || "Unknown"}
            <button onClick={() =>onConnect(device.serial)}>Connect</button>
            {device.ip && <button onClick={() =>onConnectWifi(device.serial)}>Connect With Ip</button>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DevicesList;