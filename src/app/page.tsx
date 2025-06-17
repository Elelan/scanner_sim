"use client"

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { Switch } from "@nextui-org/react";
import {
  sendIntent,
  sendScannerStatus,
  sendHotkeyIntent,
  fetchDevices,
  loadHistory,
  deleteHistoryItem,
  clearHistory,
} from '~/lib/serverActions';
import { ScannedBarcodeType, ScannedBarcodeTypeKey } from '~/lib/ScannedBarcodeType';
import { AndroidDevice, Barcode } from '~/types';

export default function Home() {

  const { theme, setTheme } = useTheme();

  const { enqueueSnackbar } = useSnackbar();

  const [selectedTab, setSelectedTab] = useState<"barcodes" | "hotkeys">("barcodes");

  const [devices, setDevices] = useState<AndroidDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");

  const [labelTypes, setLabelTypes] = useState<{ key: string, type: string }[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<ScannedBarcodeTypeKey>();

  const [dataString, setDataString] = useState<string>("");

  const [history, setHistory] = useState<Barcode[]>([]);

  const [showHotKeysHint, setShowHotKeysHint] = useState(false);
  const [showCommandHistory, setShowCommandHistory] = useState(false);

  const [loading, setLoading] = useState<boolean>(true); // Loading state

  useEffect(() => {
    async function fetchData() {
      try {
        await Promise.all([loadDevices(), loadLabelTypes(), loadHistoryData()]);
      } finally {
        setLoading(false); // Hide loading indicator after data is fetched
      }
    }
    fetchData();
  }, []);


  const loadDevices = async () => {
    try {

      const devices = await fetchDevices()

      setDevices(devices);
      if (devices.length > 0) {
        setSelectedDevice(devices[0].id);
      }

    } catch (error) {
      enqueueSnackbar('Failed to load devices: ' + error.message);
    }
  };

  useEffect(() => {
    setShowHotKeysHint(selectedTab === "hotkeys");
    setShowCommandHistory(selectedTab === "barcodes");
  }, [selectedTab]);

  const loadLabelTypes = async () => {
    const labelTypesArray = Object.keys(ScannedBarcodeType)
    console.log("labelTypesArray", labelTypesArray)
    const labelTypesArrayData = labelTypesArray.map(key => {
      const dataKey = key as ScannedBarcodeTypeKey
      const dataType = ScannedBarcodeType[key as ScannedBarcodeTypeKey]

      console.log("DecodedLabel: ", dataKey, dataType)
      return ({
        key: key as ScannedBarcodeTypeKey,
        type: ScannedBarcodeType[key as ScannedBarcodeTypeKey],
      })
    });
    console.log("labelTypesArrayData", labelTypesArrayData)
    setLabelTypes(labelTypesArrayData);

    // Automatically set the initial selected label to the first item in the list
    if (labelTypesArray.length > 0) {
      console.log("Setting first label..", labelTypesArrayData[0].key)
      setSelectedLabel(labelTypesArrayData[0].key);
    }
  };

  const loadHistoryData = async () => {
    try {
      const history = await loadHistory();
      setHistory(history);
    } catch (error) {
      enqueueSnackbar('Failed to load history: ' + error.message);
    }
  };

  const handleDeviceSelect = (device: string) => {
    setSelectedDevice(device);
  };

  const handleSendHotkey = async (keyCode: number) => {
    if (!selectedDevice) {
      enqueueSnackbar("Please select a device", { variant: "warning" });
      return;
    }

    try {
      await sendHotkeyIntent(selectedDevice, keyCode);
      enqueueSnackbar(`Hotkey ${keyCode} sent successfully`, { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to send hotkey: " + error.message, { variant: "error" });
    }
  };

  const handleSendIntent = async () => {

    console.log("Data String", dataString)
    console.log("Selected Device", selectedDevice)
    console.log("Selected Label at handleSendIntent", selectedLabel)
    if (dataString && selectedDevice && selectedLabel) {
      try {
        await sendIntent(dataString, selectedDevice, selectedLabel);
        enqueueSnackbar('Intent sent successfully');
        loadHistoryData();
      } catch (error) {
        enqueueSnackbar('Failed to send intent: ' + error.message);
      }
    } else {
      enqueueSnackbar('Please enter all required fields.');
    }

  };

  const handleSendScannerStatus = async () => {
    console.log("Selected Device", selectedDevice);
    if (selectedDevice) {
      try {
        await sendScannerStatus(selectedDevice);
        enqueueSnackbar("Scanner status intent sent successfully");
      } catch (error) {
        enqueueSnackbar("Failed to send scanner status intent: " + error.message);
      }
    } else {
      enqueueSnackbar("Please select a device.");
    }
  };

  const handleResendHistoryItem = async (id: number) => {
    try {
      const historyItem = history.find(item => item.id === id);

      if (historyItem) {
        setDataString(historyItem.data);
        setSelectedLabel(historyItem.label as ScannedBarcodeTypeKey);
        handleSendIntent();
      }
    } catch (error) {
      enqueueSnackbar('Failed to resend history item: ' + error.message);
    }
  };

  const handleDeleteHistoryItem = async (id: number) => {
    try {
      await deleteHistoryItem(id);
      enqueueSnackbar('History item deleted');
      loadHistoryData();
    } catch (error) {
      enqueueSnackbar('Failed to delete history item: ' + error.message);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      enqueueSnackbar('Command history cleared');
      loadHistoryData();
    } catch (error) {
      enqueueSnackbar('Failed to clear history: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  return (
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "top", horizontal: "right" }}>


      <div className="bg-gray-50 dark:bg-gray-800 min-h-screen p-8 flex flex-col items-center">
        {/* Main Content */}
        {/* App Bar */}
        <header className="w-full fixed top-0 left-0 z-30 bg-white/80 dark:bg-gray-900/80 shadow-md backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-800 dark:text-white select-none">Barcode Scanner Simulator</h1>
            <Switch
              size="lg"
              color="primary"
              isSelected={theme === 'dark'}
              onValueChange={(isDark) => setTheme(isDark ? 'dark' : 'light')}
              thumbIcon={({ isSelected, className }) =>
                isSelected ? (
                  <span className={className}>🌙</span>
                ) : (
                  <span className={className}>☀️</span>
                )
              }
              aria-label="Toggle dark mode"
            >
              <span className="ml-2 text-gray-700 dark:text-gray-200 text-sm font-medium">
                {theme === 'dark' ? 'Dark' : 'Light'}
              </span>
            </Switch>
          </div>
        </header>

        {/* Spacer for App Bar */}
        <div className="h-16 sm:h-20" />

        {/* Device Selector - fixed vertical position (1/3 from top) */}
        <div className="w-full flex flex-col items-center" style={{ marginTop: '10vh' }}>
          <DeviceSelector devices={devices} selectedDevice={selectedDevice} setSelectedDevice={setSelectedDevice} />
        </div>

        {/* Tabs - always below DeviceSelector */}
        <div className="w-full max-w-4xl bg-white dark:bg-gray-900 shadow-lg rounded-lg p-6 mt-6">
          <Tabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
          <div className="p-4">
            {selectedTab === "barcodes" ? (
              <BarcodesTab
                dataString={dataString}
                setDataString={setDataString}
                labelTypes={labelTypes}
                selectedLabel={selectedLabel}
                setSelectedLabel={setSelectedLabel}
                handleSendIntent={handleSendIntent}
                handleSendScannerStatus={handleSendScannerStatus}
                history={history}
                deleteHistoryItem={deleteHistoryItem}
                clearHistory={clearHistory}
                handleResendHistoryItem={handleResendHistoryItem}
              />
            ) : (
              <HotkeysTab handleSendHotkey={handleSendHotkey} />
            )}
          </div>
        </div>

        {/* HotKeysHint Card */}
        <HotKeysHint isVisible={showHotKeysHint} onClose={() => setShowHotKeysHint(false)} />

        {/* CommandHistory Card */}
        <CommandHistory
          isVisible={showCommandHistory}
          history={history}
          onClose={() => setShowCommandHistory(false)}
          deleteHistoryItem={deleteHistoryItem}
          clearHistory={clearHistory}
          onResendHistoryItem={handleResendHistoryItem}
        />

      </div>
    </SnackbarProvider>
  )

}


interface HotkeysTabProps {
  handleSendHotkey: (keyCode: number) => void;
}

const HotkeysTab: React.FC<HotkeysTabProps> = ({ handleSendHotkey }) => {
  const hotkeys = [
    { label: "F1", code: 131 },
    { label: "F2", code: 132 },
    { label: "F3", code: 133 },
    { label: "F4", code: 134 },
    { label: "F5", code: 135 },
    { label: "F6", code: 136 },
    { label: "F7", code: 137 },
    { label: "F8", code: 138 },
    { label: "F9", code: 139 },
    { label: "Ctrl+K", code: 45 },
    { label: "Ctrl+P", code: 44 },
    { label: "Ctrl+N", code: 42 },
    { label: "Ctrl+L", code: 40 },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 w-2/3">
      {hotkeys.map((hotkey) => (
        <button
          key={hotkey.code}
          onClick={() => handleSendHotkey(hotkey.code)}
          className="p-4 bg-gray-200 rounded-lg text-lg font-bold hover:bg-gray-300"
        >
          {hotkey.label}
        </button>
      ))}
    </div>


  );
};


interface BarcodesTabProps {
  dataString: string;
  setDataString: (value: string) => void;
  labelTypes: { key: string; type: string }[];
  selectedLabel: string | undefined;
  setSelectedLabel: (value: ScannedBarcodeTypeKey) => void;
  handleSendIntent: () => void;
  handleSendScannerStatus: () => void;
  history: any[];
  handleResendHistoryItem: (id: number) => void;
  deleteHistoryItem: (id: number) => void;
  clearHistory: () => void;
}

const BarcodesTab: React.FC<BarcodesTabProps> = ({
  dataString,
  setDataString,
  labelTypes,
  selectedLabel,
  setSelectedLabel,
  handleSendIntent,
  handleSendScannerStatus,
  history,
  handleResendHistoryItem,
  deleteHistoryItem,
  clearHistory,
}) => (
  <div className="space-y-6">
    {/* Form Inputs */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Data Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Data:
        </label>
        <input
          type="text"
          value={dataString}
          onChange={(e) => setDataString(e.target.value)}
          className="mt-1 p-3 border rounded w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
          placeholder="Enter data"
        />
      </div>

      {/* Label Type Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Label Type:
        </label>
        <select
          value={selectedLabel}
          onChange={(e) => setSelectedLabel(e.target.value as ScannedBarcodeTypeKey)}
          className="mt-1 p-3 border rounded w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
        >
          {labelTypes.map((label) => (
            <option key={label.key} value={label.key}>
              {label.type}
            </option>
          ))}
        </select>
      </div>
    </div>

    {/* Buttons */}
    <div className="space-y-4">
      <button
        onClick={handleSendIntent}
        className={`w-full py-3 rounded transition ${dataString.trim() === ""
          ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-gray-700 dark:text-gray-300"
          : "bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
          }`}
        disabled={dataString.trim() === ""}
      >
        Send Intent
      </button>

      <button
        onClick={handleSendScannerStatus}
        className="w-full py-3 bg-green-600 dark:bg-green-500 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 transition"
      >
        Send Scanner Status
      </button>
    </div>

    {/* Command History Section */}
    <CommandHistory
      history={history}
      onResendHistoryItem={handleResendHistoryItem}
      deleteHistoryItem={deleteHistoryItem}
      clearHistory={clearHistory}
    />
  </div>
);

interface CommandHistoryProps {
  history: {
    id: number;
    data: string;
    label: string;
  }[];
  isVisible: boolean;
  onClose: () => void;
  deleteHistoryItem: (id: number) => void;
  clearHistory: () => void;
  onResendHistoryItem: (id: number) => void;
}

const CommandHistory: React.FC<CommandHistoryProps> = ({
  history,
  isVisible,
  onClose,
  deleteHistoryItem,
  clearHistory,
  onResendHistoryItem,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-1/2 left-4 transform -translate-y-1/2 w-80 bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 z-50 border border-gray-300 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Command History</h3>
        <button
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          onClick={onClose}
        >
          ✖
        </button>
      </div>

      <div className="space-y-4">
        {history.length > 0 ? (
          history.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              <div>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  <strong>Data:</strong> {item.data}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Label:</strong> {item.label}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  className="bg-blue-500 dark:bg-blue-600 text-white py-1 px-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition"
                  onClick={() => onResendHistoryItem(item.id)}
                >
                  Send
                </button>
                <button
                  className="bg-red-500 dark:bg-red-600 text-white py-1 px-2 rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition"
                  onClick={() => deleteHistoryItem(item.id)}
                >
                  ❌
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No command history available.
          </p>
        )}

        <button
          className={`mt-4 w-full py-2 rounded-lg transition ${history.length === 0
            ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-gray-700 dark:text-gray-300"
            : "bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600"
            }`}
          onClick={clearHistory}
          disabled={history.length === 0}
        >
          Clear All
        </button>
      </div>
    </div>
  );
};


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
          className={`p-4 rounded-lg border-2 transition-all duration-200 ${selectedDevice === device.id ? "border-blue-600 bg-blue-500 text-white" : "border-gray-300 bg-gray-100"
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


interface HotKeysHintProps {
  isVisible: boolean;
  onClose: () => void;
}

const HotKeysHint: React.FC<HotKeysHintProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-1/2 right-4 transform -translate-y-1/2 w-72 bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 z-50 border border-gray-300 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Hotkey Functions
        </h3>
        <button
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          onClick={onClose}
        >
          ✖
        </button>
      </div>

      <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
        <li><strong>F1:</strong> Batch Details</li>
        <li><strong>F2:</strong> Slot Pick Quantity</li>
        <li><strong>F3:</strong> Batch Summary</li>
        <li><strong>F4:</strong> Aisle Info</li>
        <li><strong>F5:</strong> High Quantity</li>
        <li><strong>F6:</strong> Print Labels</li>
        <li><strong>F8:</strong> Change Printer</li>
        <li><strong>F9:</strong> Data Collection Status</li>
        <li><strong>Ctrl + K:</strong> Hotkey List</li>
        <li><strong>Ctrl + L:</strong> Segment Network Log</li>
        <li><strong>Ctrl + N:</strong> Network Queue Status</li>
        <li><strong>Ctrl + I:</strong> Indirect Assignment</li>
      </ul>
    </div>
  );
};


interface TabsProps {
  selectedTab: "barcodes" | "hotkeys";
  setSelectedTab: (tab: "barcodes" | "hotkeys") => void;
}

const Tabs: React.FC<TabsProps> = ({ selectedTab, setSelectedTab }) => (
  <div className="flex border-b">
    <button
      className={`w-1/2 p-4 text-center ${selectedTab === "barcodes" ? "border-b-2 border-blue-500 font-bold" : ""}`}
      onClick={() => setSelectedTab("barcodes")}
    >
      Barcodes
    </button>
    <button
      className={`w-1/2 p-4 text-center ${selectedTab === "hotkeys" ? "border-b-2 border-blue-500 font-bold" : ""}`}
      onClick={() => setSelectedTab("hotkeys")}
    >
      Hotkeys
    </button>
  </div>
);
