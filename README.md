# 🚀 Battle Proximity Detector

Sistem battle proximity detection yang keren untuk mendeteksi devices terdekat dan memulai battle secara otomatis! 💪

## ✨ Fitur Utama

- **🔍 Proximity Detection**: Mendeteksi devices terdekat menggunakan Bluetooth dan RSSI
- **⚔️ Real-time Battle**: Battle system dengan Socket.IO untuk komunikasi real-time
- **🎮 Turn-based Combat**: Sistem battle bergiliran dengan aksi Attack, Defend, dan Special
- **📱 Cross-platform**: Berjalan di Android dan iOS menggunakan React Native
- **🎨 Modern UI/UX**: Interface yang clean, modern, dan aesthetic
- **🔐 Secure**: Permissions yang tepat untuk Bluetooth dan Location

## 🛠️ Teknologi yang Digunakan

### Frontend (Mobile App)
- **React Native** dengan Expo
- **TypeScript** untuk type safety
- **React Native BLE PLX** untuk Bluetooth Low Energy
- **Socket.IO Client** untuk real-time communication
- **Expo Location** untuk GPS tracking
- **React Native Vector Icons** untuk icons

### Backend (Server)
- **Node.js** dengan Express
- **Socket.IO** untuk real-time communication
- **CORS** untuk cross-origin requests

## 📱 Screenshots

![Scanner Screen](https://via.placeholder.com/300x600/6366f1/ffffff?text=Scanner+Screen)
![Battle Screen](https://via.placeholder.com/300x600/ef4444/ffffff?text=Battle+Screen)

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js (v16 atau lebih baru)
- npm atau yarn
- Expo CLI
- Android Studio (untuk Android) atau Xcode (untuk iOS)

### 1. Setup Backend Server

```bash
# Masuk ke folder server
cd server

# Install dependencies
npm install

# Jalankan server
npm start

# Atau untuk development dengan auto-reload
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### 2. Setup Mobile App

```bash
# Install Expo CLI (jika belum)
npm install -g @expo/cli

# Install dependencies
npm install

# Jalankan aplikasi
npm start
```

### 3. Testing di Device

1. Install Expo Go di HP kamu
2. Scan QR code yang muncul di terminal
3. Aplikasi akan terbuka di device kamu

## 🔧 Konfigurasi

### Permissions

Aplikasi memerlukan permissions berikut:

**Android:**
- `BLUETOOTH`
- `BLUETOOTH_ADMIN`
- `BLUETOOTH_CONNECT`
- `BLUETOOTH_SCAN`
- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`
- `INTERNET`

**iOS:**
- `NSBluetoothAlwaysUsageDescription`
- `NSBluetoothPeripheralUsageDescription`
- `NSLocationWhenInUseUsageDescription`
- `NSLocationAlwaysAndWhenInUseUsageDescription`

### Environment Variables

Buat file `.env` di root project:

```env
BATTLE_SERVER_URL=http://localhost:3000
PROXIMITY_THRESHOLD=2
RSSI_THRESHOLD=-60
```

## 🎮 Cara Kerja

### 1. Proximity Detection
- Aplikasi akan scan devices terdekat menggunakan Bluetooth
- Menghitung jarak berdasarkan RSSI (Received Signal Strength Indicator)
- Device yang jaraknya ≤ 2 meter akan bisa di-battle

### 2. Battle System
- Ketika device terdekat terdeteksi, muncul notifikasi battle request
- Jika diterima, battle akan dimulai dengan sistem turn-based
- Setiap player memiliki HP, Attack, dan Defense stats
- Aksi yang tersedia: Attack, Defend, Special

### 3. Real-time Communication
- Menggunakan Socket.IO untuk komunikasi real-time
- Battle state disinkronkan antar devices
- Move history tersimpan di server

## 📊 API Endpoints

### Server Health Check
```
GET /health
```

### Connected Devices
```
GET /devices
```

### Active Battles
```
GET /battles
```

## 🏗️ Struktur Project

```
battle-proximity-detector/
├── src/
│   ├── components/
│   │   ├── ProximityScanner.tsx
│   │   └── BattleScreen.tsx
│   └── services/
│       ├── ProximityService.ts
│       └── BattleService.ts
├── server/
│   ├── index.js
│   └── package.json
├── App.tsx
├── package.json
├── app.json
└── README.md
```

## 🎯 Fitur Battle

### Player Stats
- **Health**: 50-100 HP
- **Attack**: 10-30 damage
- **Defense**: 5-20 protection
- **Level**: 1-10

### Battle Actions
- **Attack**: Damage normal berdasarkan attack stat
- **Defend**: Meningkatkan defense untuk turn berikutnya
- **Special**: Damage 1.5x dari attack normal

### Battle Flow
1. Device terdeteksi dalam jarak battle
2. Battle request dikirim
3. Target device menerima/menolak request
4. Jika diterima, battle dimulai
5. Turn-based combat dengan aksi
6. Battle berakhir ketika salah satu HP = 0

## 🔍 Troubleshooting

### Bluetooth tidak terdeteksi
- Pastikan Bluetooth aktif di device
- Cek permissions di Settings
- Restart aplikasi

### Server tidak terhubung
- Pastikan server berjalan di port 3000
- Cek koneksi internet
- Restart aplikasi

### Battle tidak dimulai
- Pastikan kedua device dalam jarak 2 meter
- Cek RSSI threshold (-60 dBm)
- Pastikan kedua device menjalankan aplikasi

## 🚀 Deployment

### Backend Server
```bash
# Deploy ke Heroku
heroku create battle-proximity-server
git push heroku main

# Atau ke VPS
npm install -g pm2
pm2 start index.js
```

### Mobile App
```bash
# Build untuk production
expo build:android
expo build:ios

# Atau publish ke Expo
expo publish
```

## 🤝 Contributing

1. Fork project ini
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

- **Email**: battle@proximity.com
- **GitHub**: [@battle-proximity](https://github.com/battle-proximity)

## 🙏 Acknowledgments

- React Native community
- Expo team
- Socket.IO team
- Bluetooth Low Energy documentation

---

**Happy Battling! ⚔️💪** 