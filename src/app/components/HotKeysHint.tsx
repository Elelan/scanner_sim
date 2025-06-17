"use client";

import React from "react";

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

export default HotKeysHint;
