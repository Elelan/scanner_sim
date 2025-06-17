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
  
  export default Tabs;
  