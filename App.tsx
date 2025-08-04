import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProximityScanner from './src/components/ProximityScanner';
import BattleScreen from './src/components/BattleScreen';
import { DeviceInfo } from './src/services/ProximityService';
import { BattleState, BattlePlayer } from './src/services/BattleService';
import BattleService from './src/services/BattleService';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'scanner' | 'battle'>('scanner');
  const [currentBattle, setCurrentBattle] = useState<BattleState | null>(null);
  const [showBattleModal, setShowBattleModal] = useState(false);
  const [pendingBattleRequest, setPendingBattleRequest] = useState<{
    device: DeviceInfo;
    player: BattlePlayer;
  } | null>(null);

  useEffect(() => {
    // Initialize battle service
    BattleService.connect();
    
    // Setup battle callbacks
    BattleService.setBattleCallbacks({
      onBattleStart: (battle) => {
        console.log('Battle started:', battle);
        setCurrentBattle(battle);
        setShowBattleModal(true);
        setCurrentScreen('battle');
      },
      onBattleUpdate: (battle) => {
        console.log('Battle updated:', battle);
        setCurrentBattle(battle);
      },
      onBattleEnd: (winner) => {
        console.log('Battle ended, winner:', winner);
        Alert.alert(
          'Battle Selesai!',
          `🏆 Pemenang: ${winner}`,
          [
            {
              text: 'Kembali ke Scanner',
              onPress: () => {
                setCurrentBattle(null);
                setShowBattleModal(false);
                setCurrentScreen('scanner');
              }
            }
          ]
        );
      }
    });

    return () => {
      BattleService.cleanup();
    };
  }, []);

  const handleBattleReady = (device: DeviceInfo) => {
    console.log('Battle ready with device:', device);
    
    // Generate player stats
    const playerData = BattleService.generatePlayerStats();
    
    // Show battle request modal
    Alert.alert(
      'Battle Request!',
      `Device terdekat terdeteksi: ${device.name}\nJarak: ${device.distance.toFixed(1)}m\n\nMau battle?`,
      [
        {
          text: 'Tolak',
          style: 'cancel',
          onPress: () => {
            console.log('Battle declined');
          }
        },
        {
          text: 'Battle!',
          onPress: () => {
            setPendingBattleRequest({ device, player: playerData });
            initiateBattle(device, playerData);
          }
        }
      ]
    );
  };

  const initiateBattle = async (device: DeviceInfo, playerData: BattlePlayer) => {
    try {
      const success = await BattleService.initiateBattle(device, playerData);
      if (success) {
        console.log('Battle request sent successfully');
      } else {
        Alert.alert('Error', 'Gagal mengirim permintaan battle');
      }
    } catch (error) {
      console.error('Error initiating battle:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat memulai battle');
    }
  };

  const handleBattleEnd = (winner: string) => {
    Alert.alert(
      'Battle Selesai!',
      `🏆 Pemenang: ${winner}`,
      [
        {
          text: 'Kembali ke Scanner',
          onPress: () => {
            setCurrentBattle(null);
            setShowBattleModal(false);
            setCurrentScreen('scanner');
          }
        }
      ]
    );
  };

  const renderScannerScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="wifi" size={32} color="#6366f1" />
        <Text style={styles.appTitle}>Battle Proximity Detector</Text>
        <Text style={styles.appSubtitle}>
          Temukan dan battle dengan devices terdekat! 💪
        </Text>
      </View>

      <ProximityScanner onBattleReady={handleBattleReady} />
    </View>
  );

  const renderBattleScreen = () => {
    if (!currentBattle) return null;

    return (
      <Modal
        visible={showBattleModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowBattleModal(false);
                setCurrentScreen('scanner');
              }}
            >
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>⚔️ Battle Arena</Text>
          </View>
          
          <BattleScreen 
            battle={currentBattle} 
            onBattleEnd={handleBattleEnd}
          />
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {currentScreen === 'scanner' && renderScannerScreen()}
      {currentScreen === 'battle' && renderBattleScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1e293b',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
    flex: 1,
    textAlign: 'center',
  },
}); 