import React from "react";
import { AndroidDevice } from "~/types";

interface DeviceSelectorProps {
  devices: AndroidDevice[];
  selectedDevice: string;
  setSelectedDevice: (device: string) => void;
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({ devices, selectedDevice, setSelectedDevice }) => (
  <div className="w-full max-w-4xl bg-white dark:bg-gray-900 shadow-lg rounded-lg p-6">
    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Select Device</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {devices.map((device) => (
        <button
          key={device.id}
          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
            selectedDevice === device.id ? "border-blue-600 bg-blue-500 text-white" : "border-gray-300 bg-gray-100"
          }`}
          onClick={() => setSelectedDevice(device.id)}
        >
          <h3 className="text-lg font-semibold">{device.model}</h3>
          <p className="text-sm">ID: {device.id}</p>
          <p className="text-sm">Android: {device.androidVersion}</p>
          <p className="text-sm">Battery: {device.batteryLevel}%</p>
          <p className="text-sm">Charging: {device.isCharging ? "Yes" : "No"}</p>
          <p className="text-sm">Screen: {device.screenSize}</p>
        </button>
      ))}
    </div>
  </div>
);

export default DeviceSelector;
