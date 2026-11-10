# VoyageAI — AI-First Global Travel Intelligence Platform

Bu proje hem yerel geliştirme ortamında (AI Studio / Node.js) hem de **Vercel** üzerinde tek tıkla sorunsuz şekilde deploy edilebilecek biçimde yapılandırılmıştır.

---

## 🚀 Vercel'e Deploy Etme Rehberi (Adım Adım)

### Yöntem 1: GitHub & Vercel Dashboard (En Kolay)

1. **Projeyi GitHub Deponuza Gönderin (Push edin):**
   ```bash
   git add .
   git commit -m "feat: Vercel serverless ve deploy yapılandırması"
   git push origin main
   ```

2. **Vercel Dashboard'a Giriş Yapın:**
   - [vercel.com](https://vercel.com) adresine gidin.
   - **"Add New..."** -> **"Project"** butonuna tıklayın.
   - GitHub deponuzu (`ibodeth/seyahat-uygulamasi`) seçip **Import** edin.

3. **Yapılandırma Ayarları (Vercel otomatik tanır):**
   - **Framework Preset:** Vite
   - **Build Command:** `vite build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Ortam Değişkeni (Environment Variables) Ekleyin (Opsiyonel):**
   - **Name:** `GEMINI_API_KEY`
   - **Value:** [Google AI Studio](https://aistudio.google.com/)'dan alacağınız API anahtarı.
   *(Not: API anahtarı eklenmese dahi uygulama yerleşik seyahat veri tabanıyla kesintisiz çalışır).*

5. **"Deploy" Butonuna Basın!**
   - Vercel frontend uygulamasını `dist/` klasöründen dağıtır.
   - `/api/` rotaları (`/api/gemini/generate-itinerary`, `/api/gemini/chat`, `/api/gemini/swap-activity`) Vercel Serverless Function olarak anında canlıya alınır.

---

### Yöntem 2: Vercel CLI ile Komut Satırından

```bash
# Vercel CLI kurulu değilse:
npm i -g vercel

# Proje dizininde:
vercel

# Üretime (Production) almak için:
vercel --prod
```

---

## 🛠️ Proje Mimarisi

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Motion + Lucide Icons.
- **Backend / API:** Express + Google GenAI SDK (`@google/genai`).
- **Serverless Uyum:** `vercel.json` ve `api/index.ts` ile tüm `/api/*` istekleri sunucusuz (serverless) fonksiyonlara yönlendirilir.
- **Yerel Geliştirme (Local Dev):**
  ```bash
  npm run dev
  ```
  `http://localhost:3000` adresinde Express + Vite SPA eşzamanlı çalışır.
