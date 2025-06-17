import React from "react";
import CommandHistory from "./CommandHistory";
import {ScannedBarcodeTypeKey } from "~/lib/ScannedBarcodeType";

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
        className={`w-full py-3 rounded transition ${
          dataString.trim() === ""
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

export default BarcodesTab;
