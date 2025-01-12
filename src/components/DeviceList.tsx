import React from "react";

interface Device {
  serial: string;
  model: string;
}

const DevicesList: React.FC<{ devices: Device[] }> = ({ devices }) => {
  return (
    <div className="devices-list">
      <h2>Devices</h2>
      <ul>
        {devices.map((device) => (
          <li key={device.serial}>
            <strong>Serial:</strong> {device.serial} - <strong>Model:</strong> {device.model || "Unknown"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DevicesList;