import { BleManager } from 'react-native-ble-plx';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';

export interface DeviceInfo {
  id: string;
  name: string;
  distance: number;
  rssi: number;
  lastSeen: Date;
}

export interface ProximityEvent {
  type: 'device_detected' | 'device_lost' | 'battle_ready';
  device: DeviceInfo;
}

class ProximityService {
  private bleManager: BleManager;
  private isScanning: boolean = false;
  private detectedDevices: Map<string, DeviceInfo> = new Map();
  private onProximityEvent?: (event: ProximityEvent) => void;
  private battleThreshold: number = 2; // meter
  private rssiThreshold: number = -60; // dBm

  constructor() {
    this.bleManager = new BleManager();
  }

  async initialize(): Promise<boolean> {
    try {
      // Request permissions
      const locationPermission = await Location.requestForegroundPermissionsAsync();
      const bluetoothPermission = await this.requestBluetoothPermission();

      if (!locationPermission.granted || !bluetoothPermission) {
        console.log('Permissions not granted');
        return false;
      }

      // Enable Bluetooth
      await this.bleManager.enableBluetooth();
      
      return true;
    } catch (error) {
      console.error('Error initializing proximity service:', error);
      return false;
    }
  }

  private async requestBluetoothPermission(): Promise<boolean> {
    try {
      // This is a simplified version - in real app you'd need proper permission handling
      return true;
    } catch (error) {
      console.error('Bluetooth permission error:', error);
      return false;
    }
  }

  startScanning(): void {
    if (this.isScanning) return;

    this.isScanning = true;
    console.log('🚀 Memulai scan untuk devices terdekat...');

    this.bleManager.startDeviceScan(
      null, // null means scan for all devices
      { allowDuplicates: true },
      (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          return;
        }

        if (device && device.name) {
          this.handleDeviceDetected(device);
        }
      }
    );
  }

  stopScanning(): void {
    if (!this.isScanning) return;

    this.isScanning = false;
    this.bleManager.stopDeviceScan();
    console.log('⏹️ Berhenti scan devices');
  }

  private handleDeviceDetected(device: any): void {
    const deviceInfo: DeviceInfo = {
      id: device.id,
      name: device.name || 'Unknown Device',
      distance: this.calculateDistance(device.rssi),
      rssi: device.rssi,
      lastSeen: new Date()
    };

    const existingDevice = this.detectedDevices.get(device.id);
    
    if (!existingDevice) {
      // New device detected
      this.detectedDevices.set(device.id, deviceInfo);
      this.onProximityEvent?.({
        type: 'device_detected',
        device: deviceInfo
      });
    } else {
      // Update existing device
      this.detectedDevices.set(device.id, deviceInfo);
      
      // Check if device is close enough for battle
      if (deviceInfo.distance <= this.battleThreshold && deviceInfo.rssi >= this.rssiThreshold) {
        this.onProximityEvent?.({
          type: 'battle_ready',
          device: deviceInfo
        });
      }
    }
  }

  private calculateDistance(rssi: number): number {
    // Simple distance calculation based on RSSI
    // In real implementation, you'd use more sophisticated algorithms
    const txPower = -69; // Calibrated power at 1 meter
    const n = 2.0; // Path loss exponent
    
    if (rssi === 0) return -1;
    
    const ratio = rssi * 1.0 / txPower;
    if (ratio < 1.0) {
      return Math.pow(ratio, 10.0);
    } else {
      return 0.89976 * Math.pow(ratio, 7.7095) + 0.111;
    }
  }

  getDetectedDevices(): DeviceInfo[] {
    return Array.from(this.detectedDevices.values());
  }

  setProximityCallback(callback: (event: ProximityEvent) => void): void {
    this.onProximityEvent = callback;
  }

  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      return location;
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  cleanup(): void {
    this.stopScanning();
    this.bleManager.destroy();
  }
}

export default new ProximityService(); 