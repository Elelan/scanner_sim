"use client"

import { useState, useEffect } from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { sendIntent, fetchDevices, loadHistory } from '~/lib/serverActions';
import { ScannedBarcodeType, ScannedBarcodeTypeKey } from '~/lib/ScannedBarcodeType';
import { AndroidDevice, Barcode } from '~/types';
import { prisma } from '~/lib/prisma';

export default function Home() {

  const { enqueueSnackbar } = useSnackbar();

  const [devices, setDevices] = useState<AndroidDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");

  const [labelTypes, setLabelTypes] = useState<{ key: string, type: string }[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<ScannedBarcodeTypeKey>();

  const [dataString, setDataString] = useState<string>("");

  const [history, setHistory] = useState<Barcode[]>([]);

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
      await prisma.barcodes.delete({
        where: { id },
      });
      enqueueSnackbar('History item deleted');
      loadHistoryData();
    } catch (error) {
      enqueueSnackbar('Failed to delete history item: ' + error.message);
    }
  };

  const handleClearHistory = async () => {
    try {
      await prisma.barcodes.deleteMany({});
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
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Barcode Scanner Simulator</h1>

        <form className="mb-8" onSubmit={(e) => e.preventDefault()}>
          <div className="mb-6">
            <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700">
              Select Device:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4" id="deviceList">
              {devices.length > 0 ? (
                devices.map((device) => (
                  <button
                    key={device.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedDevice === device.id
                      ? 'border-blue-600 bg-blue-500 shadow-lg dark:bg-blue-100'
                      : 'border-gray-300 bg-white hover:shadow-md dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
                      }`}
                    onClick={() => handleDeviceSelect(device.id)}
                  >
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{device.model}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400"><strong>ID:</strong> {device.id}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Android Version:</strong> {device.androidVersion}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Battery Level:</strong> {device.batteryLevel}%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Charging:</strong> {device.isCharging ? 'Yes' : 'No'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Screen Size:</strong> {device.screenSize}</p>
                  </button>
                ))
              ) : (
                <small className="text-red-500" id="noDeviceMessage">
                  No device detected. Please restart ADB.
                </small>
              )}
            </div>
            <input
              type="text"
              id="deviceId"
              className="mt-4 p-3 border rounded w-full focus:ring focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter device ID manually"
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="dataString" className="block text-sm font-medium text-gray-700">
                Data:
              </label>
              <input
                type="text"
                id="dataString"
                name="dataString"
                className="mt-2 p-3 border rounded w-full focus:ring focus:ring-blue-500 focus:border-blue-500"
                value={dataString}
                onChange={(e) => setDataString(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendIntent()}
              />
            </div>
            <div>
              <label htmlFor="labelType" className="block text-sm font-medium text-gray-700">
                Label Type:
              </label>
              <select
                id="labelType"
                name="labelType"
                className="mt-2 p-3 border rounded w-full focus:ring focus:ring-blue-500 focus:border-blue-500"
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
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
            onClick={handleSendIntent}
          >
            Send Intent
          </button>
        </form>

        <h2 className="text-2xl font-bold mb-4 text-gray-800">Command History</h2>
        <ul className="space-y-4">
          {history.map((item) => (
            <li key={item.id} className="bg-gray-50 p-4 rounded shadow flex justify-between items-center">
              <div>
                <p className="text-sm">
                  <strong>Data String:</strong> {item.data}
                </p>
                <p className="text-sm">
                  <strong>Label Type:</strong> {item.label}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
                  onClick={() => handleResendHistoryItem(item.id)}
                >
                  Send Again
                </button>
                <button
                  className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
                  onClick={() => handleDeleteHistoryItem(item.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button
          className="mt-6 w-full bg-red-600 text-white py-3 rounded hover:bg-red-700 transition"
          onClick={handleClearHistory}
        >
          Clear All History
        </button>
      </div>
    </SnackbarProvider>
  )
}