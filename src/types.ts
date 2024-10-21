export type Barcode = {
    id: number;
    createdAt: Date;
    data: string;
    label: string;
    isPinned: boolean;
  };

  export type AndroidDevice = {
    id: string;
    model: string;
    androidVersion: string;
    batteryLevel: number;
    isCharging: boolean;
    screenSize: string;
};