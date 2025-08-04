import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProximityService, { DeviceInfo, ProximityEvent } from '../services/ProximityService';
import BattleService, { BattlePlayer } from '../services/BattleService';

const { width, height } = Dimensions.get('window');

interface ProximityScannerProps {
  onBattleReady: (device: DeviceInfo) => void;
}

const ProximityScanner: React.FC<ProximityScannerProps> = ({ onBattleReady }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeProximityService();
    return () => {
      ProximityService.cleanup();
    };
  }, []);

  const initializeProximityService = async () => {
    try {
      const success = await ProximityService.initialize();
      if (success) {
        setIsInitialized(true);
        setupProximityCallbacks();
        console.log('✅ Proximity service berhasil diinisialisasi');
      } else {
        Alert.alert(
          'Permission Diperlukan',
          'Aplikasi memerlukan akses Bluetooth dan Lokasi untuk mendeteksi devices terdekat'
        );
      }
    } catch (error) {
      console.error('Error initializing proximity service:', error);
      Alert.alert('Error', 'Gagal menginisialisasi proximity service');
    }
  };

  const setupProximityCallbacks = () => {
    ProximityService.setProximityCallback((event: ProximityEvent) => {
      if (event.type === 'device_detected') {
        setDevices(prev => {
          const existing = prev.find(d => d.id === event.device.id);
          if (existing) {
            return prev.map(d => d.id === event.device.id ? event.device : d);
          } else {
            return [...prev, event.device];
          }
        });
      } else if (event.type === 'battle_ready') {
        onBattleReady(event.device);
      }
    });
  };

  const startScanning = () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Proximity service belum siap');
      return;
    }

    setIsScanning(true);
    ProximityService.startScanning();
    
    // Auto-stop scanning after 30 seconds
    setTimeout(() => {
      stopScanning();
    }, 30000);
  };

  const stopScanning = () => {
    setIsScanning(false);
    ProximityService.stopScanning();
  };

  const initiateBattle = async (device: DeviceInfo) => {
    try {
      const playerData = BattleService.generatePlayerStats();
      const success = await BattleService.initiateBattle(device, playerData);
      
      if (success) {
        Alert.alert(
          'Battle Request',
          `Mengirim permintaan battle ke ${device.name}...`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Gagal mengirim permintaan battle');
      }
    } catch (error) {
      console.error('Error initiating battle:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat memulai battle');
    }
  };

  const renderDevice = ({ item }: { item: DeviceInfo }) => (
    <View style={styles.deviceCard}>
      <View style={styles.deviceInfo}>
        <Ionicons 
          name="phone-portrait" 
          size={24} 
          color="#6366f1" 
        />
        <View style={styles.deviceDetails}>
          <Text style={styles.deviceName}>{item.name}</Text>
          <Text style={styles.deviceDistance}>
            Jarak: {item.distance.toFixed(1)}m (RSSI: {item.rssi}dBm)
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[
          styles.battleButton,
          item.distance <= 2 ? styles.battleReady : styles.battleDisabled
        ]}
        onPress={() => initiateBattle(item)}
        disabled={item.distance > 2}
      >
        <Ionicons 
          name="sword" 
          size={20} 
          color={item.distance <= 2 ? "#ffffff" : "#9ca3af"} 
        />
        <Text style={[
          styles.battleButtonText,
          item.distance <= 2 ? styles.battleReadyText : styles.battleDisabledText
        ]}>
          {item.distance <= 2 ? 'Battle!' : 'Terlalu Jauh'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Scanner Devices</Text>
        <Text style={styles.subtitle}>
          Cari devices terdekat untuk battle
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.scanButton, isScanning && styles.scanningButton]}
        onPress={isScanning ? stopScanning : startScanning}
        disabled={!isInitialized}
      >
        {isScanning ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Ionicons name="search" size={24} color="#ffffff" />
        )}
        <Text style={styles.scanButtonText}>
          {isScanning ? 'Menghentikan Scan...' : 'Mulai Scan'}
        </Text>
      </TouchableOpacity>

      <View style={styles.devicesContainer}>
        <Text style={styles.devicesTitle}>
          Devices Terdeteksi ({devices.length})
        </Text>
        
        {devices.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wifi-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>
              Belum ada devices terdeteksi
            </Text>
            <Text style={styles.emptySubtext}>
              Pastikan Bluetooth aktif dan devices lain menjalankan aplikasi ini
            </Text>
          </View>
        ) : (
          <FlatList
            data={devices}
            renderItem={renderDevice}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.devicesList}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scanningButton: {
    backgroundColor: '#ef4444',
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  devicesContainer: {
    flex: 1,
  },
  devicesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  devicesList: {
    paddingBottom: 20,
  },
  deviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceDetails: {
    flex: 1,
    marginLeft: 12,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  deviceDistance: {
    fontSize: 14,
    color: '#64748b',
  },
  battleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  battleReady: {
    backgroundColor: '#10b981',
  },
  battleDisabled: {
    backgroundColor: '#f3f4f6',
  },
  battleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  battleReadyText: {
    color: '#ffffff',
  },
  battleDisabledText: {
    color: '#9ca3af',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default ProximityScanner; 