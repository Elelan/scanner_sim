import React from "react";
import HintsCard from "./HotKeysHint";

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

export default HotkeysTab;
