import io, { Socket } from 'socket.io-client';
import { DeviceInfo } from './ProximityService';

export interface BattlePlayer {
  id: string;
  name: string;
  health: number;
  attack: number;
  defense: number;
  level: number;
}

export interface BattleState {
  id: string;
  players: BattlePlayer[];
  currentTurn: string;
  status: 'waiting' | 'active' | 'finished';
  winner?: string;
  moves: BattleMove[];
}

export interface BattleMove {
  playerId: string;
  action: 'attack' | 'defend' | 'special';
  targetId?: string;
  damage?: number;
  timestamp: Date;
}

class BattleService {
  private socket: Socket | null = null;
  private serverUrl: string = process.env.REACT_APP_API_URL || 'http://localhost:3000'; // URL dari environment variable
  private currentBattle: BattleState | null = null;
  private onBattleUpdate?: (battle: BattleState) => void;
  private onBattleStart?: (battle: BattleState) => void;
  private onBattleEnd?: (winner: string) => void;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    this.socket = io(this.serverUrl, {
      transports: ['websocket'],
      autoConnect: false
    });

    this.socket.on('connect', () => {
      console.log('🔌 Terhubung ke battle server');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Terputus dari battle server');
    });

    this.socket.on('battle_started', (battle: BattleState) => {
      console.log('⚔️ Battle dimulai!', battle);
      this.currentBattle = battle;
      this.onBattleStart?.(battle);
    });

    this.socket.on('battle_update', (battle: BattleState) => {
      console.log('🔄 Update battle:', battle);
      this.currentBattle = battle;
      this.onBattleUpdate?.(battle);
    });

    this.socket.on('battle_ended', (data: { winner: string }) => {
      console.log('🏆 Battle selesai! Pemenang:', data.winner);
      this.onBattleEnd?.(data.winner);
    });

    this.socket.on('error', (error: any) => {
      console.error('Battle service error:', error);
    });
  }

  connect(): void {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect(): void {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }
  }

  async initiateBattle(targetDevice: DeviceInfo, playerData: BattlePlayer): Promise<boolean> {
    try {
      if (!this.socket?.connected) {
        this.connect();
      }

      const battleRequest = {
        targetDeviceId: targetDevice.id,
        player: playerData,
        timestamp: new Date()
      };

      this.socket?.emit('initiate_battle', battleRequest);
      
      console.log('⚔️ Mengirim permintaan battle ke:', targetDevice.name);
      return true;
    } catch (error) {
      console.error('Error initiating battle:', error);
      return false;
    }
  }

  acceptBattle(battleId: string, playerData: BattlePlayer): void {
    this.socket?.emit('accept_battle', {
      battleId,
      player: playerData
    });
    console.log('✅ Menerima battle:', battleId);
  }

  declineBattle(battleId: string): void {
    this.socket?.emit('decline_battle', battleId);
    console.log('❌ Menolak battle:', battleId);
  }

  makeMove(action: 'attack' | 'defend' | 'special', targetId?: string): void {
    if (!this.currentBattle) {
      console.error('Tidak ada battle aktif');
      return;
    }

    const move: BattleMove = {
      playerId: this.socket?.id || '',
      action,
      targetId,
      timestamp: new Date()
    };

    this.socket?.emit('make_move', move);
    console.log('🎯 Melakukan move:', action);
  }

  getCurrentBattle(): BattleState | null {
    return this.currentBattle;
  }

  setBattleCallbacks(callbacks: {
    onBattleStart?: (battle: BattleState) => void;
    onBattleUpdate?: (battle: BattleState) => void;
    onBattleEnd?: (winner: string) => void;
  }): void {
    this.onBattleStart = callbacks.onBattleStart;
    this.onBattleUpdate = callbacks.onBattleUpdate;
    this.onBattleEnd = callbacks.onBattleEnd;
  }

  // Generate random player stats
  generatePlayerStats(): BattlePlayer {
    return {
      id: this.socket?.id || Math.random().toString(36).substr(2, 9),
      name: `Player_${Math.floor(Math.random() * 1000)}`,
      health: Math.floor(Math.random() * 50) + 50, // 50-100
      attack: Math.floor(Math.random() * 20) + 10,  // 10-30
      defense: Math.floor(Math.random() * 15) + 5,  // 5-20
      level: Math.floor(Math.random() * 10) + 1     // 1-10
    };
  }

  cleanup(): void {
    this.disconnect();
    this.currentBattle = null;
  }
}

export default new BattleService(); 