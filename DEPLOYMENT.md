# 🚀 Panduan Deployment Battle Proximity App

## 📋 Prerequisites
- Akun GitLab (sudah ada)
- Akun Railway (gratis)
- Akun Vercel (gratis)

## 🎯 Step 1: Deploy Backend ke Railway

### 1.1 Buat Akun Railway
1. Kunjungi [railway.app](https://railway.app)
2. Sign up dengan GitHub/GitLab
3. Verifikasi email

### 1.2 Deploy Backend
1. Login ke Railway dashboard
2. Klik "New Project" → "Deploy from GitHub repo"
3. Pilih repository GitLab kamu
4. Pilih folder `server/` sebagai root directory
5. Railway akan otomatis detect Node.js dan deploy

### 1.3 Konfigurasi Environment Variables
Setelah deploy, tambahkan environment variables:
```
NODE_ENV=production
PORT=3000
```

### 1.4 Dapatkan URL Backend
- Railway akan kasih URL seperti: `https://your-app-name.railway.app`
- Simpan URL ini untuk konfigurasi frontend

## 🎨 Step 2: Deploy Frontend ke Vercel

### 2.1 Buat Akun Vercel
1. Kunjungi [vercel.com](https://vercel.com)
2. Sign up dengan GitHub/GitLab
3. Verifikasi email

### 2.2 Deploy Frontend
1. Login ke Vercel dashboard
2. Klik "New Project"
3. Import repository GitLab kamu
4. Konfigurasi build settings:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build:web`
   - **Output Directory**: `web-build`
   - **Install Command**: `npm install`

### 2.3 Konfigurasi Environment Variables
Tambahkan environment variable:
```
REACT_APP_API_URL=https://your-railway-app.railway.app
```

## 🔧 Step 3: Update Frontend untuk Production

### 3.1 Update API URL
Buka file `src/services/BattleService.ts` dan update URL:

```typescript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
```

### 3.2 Test Deployment
1. Akses URL Vercel kamu
2. Test fitur proximity detection
3. Pastikan koneksi ke backend berfungsi

## 📱 Step 4: Deploy Mobile App

### 4.1 Expo Build
```bash
# Build untuk Android
expo build:android

# Build untuk iOS
expo build:ios
```

### 4.2 Update App Configuration
Update `app.json` dengan URL production:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-railway-app.railway.app"
    }
  }
}
```

## 🔍 Monitoring & Debugging

### Railway Logs
- Akses Railway dashboard
- Klik project kamu
- Tab "Deployments" untuk lihat logs

### Vercel Logs
- Akses Vercel dashboard
- Klik project kamu
- Tab "Functions" untuk lihat logs

## 💰 Biaya
- **Railway**: $5 credit/bulan (gratis untuk project kecil)
- **Vercel**: 100GB bandwidth/bulan (gratis)
- **Total**: Gratis untuk penggunaan normal

## 🆘 Troubleshooting

### Backend tidak bisa diakses
1. Cek Railway logs
2. Pastikan port 3000 terbuka
3. Test health check endpoint

### Frontend tidak connect ke backend
1. Cek environment variable `REACT_APP_API_URL`
2. Pastikan CORS sudah dikonfigurasi
3. Test API endpoint manual

### Mobile app tidak work
1. Update API URL di `app.json`
2. Rebuild app dengan `expo build`
3. Test di device fisik

## 📞 Support
Jika ada masalah, cek:
- Railway documentation: https://docs.railway.app
- Vercel documentation: https://vercel.com/docs
- Expo documentation: https://docs.expo.dev 