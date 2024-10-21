"use client"

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { SnackbarProvider, useSnackbar } from 'notistack';
import {
  sendIntent,
  fetchDevices,
  loadHistory,
  deleteHistoryItem,
  clearHistory,
} from '~/lib/serverActions';
import { ScannedBarcodeType, ScannedBarcodeTypeKey } from '~/lib/ScannedBarcodeType';
import { AndroidDevice, Barcode } from '~/types';
import { prisma } from '~/lib/prisma';

export default function Home() {

  const { theme, setTheme } = useTheme();

  const { enqueueSnackbar } = useSnackbar();

  const [devices, setDevices] = useState<AndroidDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");

  const [labelTypes, setLabelTypes] = useState<{ key: string, type: string }[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<ScannedBarcodeTypeKey>();

  const [dataString, setDataString] = useState<string>("");

  const [history, setHistory] = useState<Barcode[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(false);

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
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Barcode Scanner Simulator</h1>

          {/* Theme Switcher */}
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="p-2 border rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
          >
            <option value="system">System</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>

        <form className="mb-8" onSubmit={(e) => e.preventDefault()}>
          <div className="mb-6">

            <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Select Device:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4" id="deviceList">

              {devices.length > 0 ? (
                devices.map((device) => (

                  <button
                    key={device.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedDevice === device.id
                      ? 'border-blue-600 bg-blue-500 dark:bg-blue-800 shadow-lg'
                      : 'border-gray-300 bg-white hover:shadow-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200'
                      }`}
                    onClick={() => handleDeviceSelect(device.id)}
                  >
                    <h3 className={`text-xl font-semibold ${selectedDevice === device.id ? 'text-white' : 'text-gray-800'}`}>{device.model}</h3>
                    <p className={`text-sm ${selectedDevice === device.id ? 'text-white' : 'text-gray-600'}`}><strong>ID:</strong> {device.id}</p>
                    <p className={`text-sm ${selectedDevice === device.id ? 'text-white' : 'text-gray-600'}`}><strong>Android Version:</strong> {device.androidVersion}</p>
                    <p className={`text-sm ${selectedDevice === device.id ? 'text-white' : 'text-gray-600'}`}><strong>Battery Level:</strong> {device.batteryLevel}%</p>
                    <p className={`text-sm ${selectedDevice === device.id ? 'text-white' : 'text-gray-600'}`}><strong>Charging:</strong> {device.isCharging ? 'Yes' : 'No'}</p>
                    <p className={`text-sm ${selectedDevice === device.id ? 'text-white' : 'text-gray-600'}`}><strong>Screen Size:</strong> {device.screenSize}</p>
                  </button>
                ))
              ) : (
                <small className="text-red-500 dark:text-red-400" id="noDeviceMessage">
                  No device detected. Please restart ADB.
                </small>
              )}
            </div>


            <input
              type="text"
              id="deviceId"
              className="mt-4 p-3 border rounded w-full focus:ring focus:ring-green-800 focus:border-red-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
              placeholder="Enter device ID manually"
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="dataString" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Data:
              </label>
              <input
                type="text"
                id="dataString"
                name="dataString"
                className="mt-2 p-3 border rounded w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                value={dataString}
                onChange={(e) => setDataString(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendIntent()}
              />
            </div>
            <div>
              <label htmlFor="labelType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Label Type:
              </label>
              <select
                id="labelType"
                name="labelType"
                className="mt-2 p-3 border rounded w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                value={selectedLabel}
                onChange={(e) => {
                  console.log("selected label type: ", e.target.value);
                  setSelectedLabel(e.target.value as ScannedBarcodeTypeKey)
                }}
              >
                {labelTypes.map((labelType, index) => (
                  <option key={index} value={labelType.key}>
                    {labelType.key} - {labelType.type}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            className={`mt-6 w-full py-3 rounded transition ${dataString.trim() === ''
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-gray-700 dark:text-gray-300'
              : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
              }`}
            onClick={handleSendIntent}
            disabled={dataString.trim() === ''}
          >
            Send Intent
          </button>
        </form>

        <div className="mb-4">
          <h2
            className="text-2xl font-bold mb-2 text-gray-800 dark:text-white flex justify-between items-center cursor-pointer"
            onClick={() => setIsHistoryVisible(!isHistoryVisible)}
          >
            Command History
            <span>{isHistoryVisible ? '▲' : '▼'}</span>
          </h2>

          {isHistoryVisible && (<>

            <ul className="space-y-4">
              {history.map((item) => (
                <li key={item.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded shadow flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      <strong>Data String:</strong> {item.data}
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      <strong>Label Type:</strong> {item.label}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="bg-green-500 dark:bg-green-600 text-white py-2 px-4 rounded hover:bg-green-600 dark:hover:bg-green-700 transition"
                      onClick={() => handleResendHistoryItem(item.id)}
                    >
                      Send Again
                    </button>
                    <button
                      className="bg-red-500 dark:bg-red-600 text-white py-2 px-4 rounded hover:bg-red-600 dark:hover:bg-red-700 transition"
                      onClick={() => handleDeleteHistoryItem(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>


            <button
              className={`mt-6 w-full py-3 rounded transition ${history.length === 0
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-gray-700 dark:text-gray-300'
                : 'bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600'
                }`}
              onClick={handleClearHistory}
              disabled={history.length === 0}
            >
              Clear All History
            </button>
          </>)}



        </div>

      </div>
    </SnackbarProvider>
  )
}