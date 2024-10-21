'use server'


import { exec } from 'child_process';
import { prisma } from '~/lib/prisma';
import { AndroidDevice, Barcode } from '~/types';

export async function sendIntent(dataString: string, selectedDevice: string, selectedLabel: string) {
    if (!dataString || !selectedDevice || !selectedLabel) {
        throw new Error('Missing required fields');
    }

    console.log("labelType at serverActions: ", selectedLabel)

    // Server-side logic
    const existingBarcode = await prisma.barcodes.findUnique({
        where: { data: dataString },
    });

    if (!existingBarcode) {
        await prisma.barcodes.create({
            data: {
                data: dataString,
                label: selectedLabel,
            },
        });
    }

    // Prepend "LABEL-TYPE-" to the selected label
    const labelWithPrefix = `LABEL-TYPE-${selectedLabel}`;
    console.log(labelWithPrefix)
    const command = `adb -s ${selectedDevice} shell am broadcast -a "Sysco.Swms.Mobile.BARCODE" --es com.symbol.datawedge.data_string "${dataString}" --es com.symbol.datawedge.label_type "${labelWithPrefix}"`;
    // const command = ""
    console.log("command: ", command)

    return new Promise<void>((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error || stderr) {
                print(error)
                reject(new Error('Command execution failed'));
            } else {
                resolve();
            }
        });
    });
}

export async function fetchDevices(): Promise<AndroidDevice[]> {
    return new Promise((resolve, reject) => {
        exec('adb devices', (error, stdout, stderr) => {
            if (error || stderr) {
                reject(new Error('Failed to load devices'));
            } else {
                const deviceIds = stdout
                    .split('\n')
                    .slice(1)
                    .filter(line => line.trim())
                    .map(line => line.split('\t')[0]);

                    Promise.all(deviceIds.map(id => getDeviceDetails(id)))
                    .then(devices => resolve(devices))
                    .catch(err => reject(err));
            }
        });
    });
}

export async function getDeviceDetails(deviceId: string): Promise<AndroidDevice> {
    return new Promise((resolve, reject) => {
        exec(`adb -s ${deviceId} shell getprop ro.product.model`, (error, model, stderr) => {
            if (error || stderr) {
                reject(new Error('Failed to retrieve model'));
            }
            exec(`adb -s ${deviceId} shell getprop ro.build.version.release`, (error, androidVersion, stderr) => {
                if (error || stderr) {
                    reject(new Error('Failed to retrieve Android version'));
                }
                exec(`adb -s ${deviceId} shell dumpsys battery`, (error, batteryInfo, stderr) => {
                    if (error || stderr) {
                        reject(new Error('Failed to retrieve battery info'));
                    }

                    // Extract relevant battery info
                    const batteryLevelMatch = batteryInfo.match(/level: (\d+)/);
                    const batteryLevel = batteryLevelMatch ? parseInt(batteryLevelMatch[1], 10) : null;

                    const isChargingMatch = batteryInfo.match(/AC powered: (\w+)/);
                    const isCharging = isChargingMatch ? isChargingMatch[1] === 'true' : false;


                    exec(`adb -s ${deviceId} shell wm size`, (error, screenSizeInfo, stderr) => {
                        if (error || stderr) {
                            reject(new Error('Failed to retrieve screen size'));
                        }

                         // Extract screen size (e.g., "800x480")
                         const screenSizeMatch = screenSizeInfo.match(/Physical size: (\d+x\d+)/);
                         const screenSize = screenSizeMatch ? screenSizeMatch[1] : 'Unknown';

                        
                        resolve({
                            id: deviceId,
                            model: model.trim(),
                            androidVersion: androidVersion.trim(),
                            batteryLevel: batteryLevel || 0,
                            isCharging,
                            screenSize,
                        });
                    });
                });
            });
        });
    });
}

export async function loadHistory(): Promise<Barcode[]> {
    const history = await prisma.barcodes.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });

    return history.map(item => ({
        id: item.id,
        createdAt: item.createdAt,
        data: item.data,
        label: item.label,
        isPinned: item.isPinned,
    }));
}