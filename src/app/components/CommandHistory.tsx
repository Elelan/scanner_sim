"use client";

import React from "react";

interface CommandHistoryProps {
  history: {
    id: number;
    data: string;
    label: string;
  }[];
  deleteHistoryItem: (id: number) => void;
  clearHistory: () => void;
  onResendHistoryItem: (id: number) => void;
}

const CommandHistory: React.FC<CommandHistoryProps> = ({
  history,
  deleteHistoryItem,
  clearHistory,
  onResendHistoryItem,
}) => {
  const [isHistoryVisible, setIsHistoryVisible] = React.useState<boolean>(true);

  return (
    <div className="mt-8 border-t pt-6">
      <h2
        className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex justify-between items-center cursor-pointer"
        onClick={() => setIsHistoryVisible(!isHistoryVisible)}
      >
        Command History
        <span className="text-lg">{isHistoryVisible ? "▲" : "▼"}</span>
      </h2>

      {isHistoryVisible && (
        <div className="space-y-4">
          {history.length > 0 ? (
            history.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-all"
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
                    className="bg-blue-500 dark:bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition"
                    onClick={() => onResendHistoryItem(item.id)}
                  >
                    Send Again
                  </button>
                  <button
                    className="bg-red-500 dark:bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition"
                    onClick={() => deleteHistoryItem(item.id)}
                  >
                    Delete
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
            className={`mt-4 w-full py-3 rounded-lg transition ${
              history.length === 0
                ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-gray-700 dark:text-gray-300"
                : "bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600"
            }`}
            onClick={clearHistory}
            disabled={history.length === 0}
          >
            Clear All History
          </button>
        </div>
      )}
    </div>
  );
};

export default CommandHistory;
