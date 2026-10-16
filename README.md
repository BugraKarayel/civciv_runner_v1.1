# 🐥 Civciv Runner (Prototype)

[English](#english) | [Türkçe](#türkçe)

---

<a name="english"></a>
## English

A retro pixel-art endless runner game developed for **GDG on Campus Bolu Abant Izzet Baysal University**. It combines classic Google Chrome Dino mechanics with Flappy Bird aerial gameplay.

### 🎮 Features
- **Dual Gameplay Modes:**
  - **Ground Mode (Dino Style):** Jump over rocks and cacti while grabbing seeds placed atop obstacles. Features air double jump!
  - **Flight Mode (Flappy Style):** Launch off ramps into the air and glide through branded pipes with flap physics.
- **Character Skins & Themes:**
  - **3 Playable Skins:** Classic Chick, Detective with Glasses, and Turkish National Team Footballer (kit and boots).
  - **4 Color Palettes:** Switch between Classic Rainbow (7 colors), Pop (5 colors), Neon Cyber (5 colors), and Full Pastel World (including soft ground, pastel sky, and pastel night flight).
  - **Konami Code Easter Egg:** Unlock dynamic rainbow trails behind the character.
- **Ramp & Pit Mechanic:** Hitting the ramp launches you into the air. If you avoid or miss the ramp, you fall into the void and game over.
- **Scoring & Seed Balance:** `Net Score = Distance Score + Seed Score` (+15 points per standard seed, +25 points for high double-jump seeds, floating retro gold animations).
- **Personal Best & High Score:** Tracks your personal best score locally across sessions.
- **Google Dino Acceleration:** Continuous smooth speed ramp (`ACCELERATION = 0.0018`) and celebratory 100m milestones (chime sound, sparks, flashing distance display).
- **Daily Leaderboard & Moderation:** LocalStorage-based Daily Top 10 leaderboard with automatic leetspeak/profanity filtering (`Civciv#XXX`) and hidden admin tools (`Ctrl + Shift + A`).
- **Display Optimization:** VSync-quantized delta timing and integer pixel snapping for stutter-free 60Hz and high-refresh-rate displays (144Hz, 165Hz, 240Hz).
- **Quality of Life:** Pause/resume (`Escape`) and fast falling (`↓` / `S`).

---

### 🚀 How to Run Locally

Because the game uses modern ES modules (`import`/`export`), it must be served over a local HTTP server rather than opened directly via `file://`.

#### Quick Start (Windows - Zero Setup)
Simply double-click **`oyunu_baslat.bat`**. It automatically detects Python, Node.js, or native Windows PowerShell to start a local server at `http://localhost:8000` and opens your browser.

#### Option 1: Using Python
1. Start a local server:
   ```bash
   python -m http.server 8000
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

#### Option 2: Using Node.js / npx
```bash
npx serve .
```

#### Option 3: VS Code Live Server
- Open the project folder in **VS Code**.
- Install the **Live Server** extension.
- Right-click `index.html` and click **"Open with Live Server"**.

### ⌨️ Controls
| Action | Key / Input |
|---|---|
| **Jump / Double Jump / Flap** | `Space` or `Mouse Click / Tap` |
| **Fast Fall** | `↓` (Arrow Down) or `S` |
| **Switch Skin** | `C` or `S` (in menu) or click skin cards / vitrine |
| **Switch Palette** | `P` or `1` - `4` (4: Full Pastel Mode) |
| **Pause / Resume** | `Escape` |
| **God Mode (Invincible)** | `Ctrl + G` |
| **Admin Panel** | `Ctrl + Shift + A` (or `Ctrl + A + D`) |
| **Konami Code (Trail)** | `↑ ↑ ↓ ↓ ← → ← → B A` |

---

<a name="türkçe"></a>
## Türkçe

**GDG on Campus Bolu Abant İzzet Baysal Üniversitesi** için geliştirilmiş retro piksel temalı sonsuz koşu (endless runner) oyunu. Klasik Google Dino koşu mekaniği ile Flappy Bird uçuş dinamiğini bir araya getirir.

### 🎮 Özellikler
- **İki Farklı Oyun Modu:**
  - **Kara Modu (Dino Stili):** Kaya ve kaktüs engellerinin üzerinden zıplayarak ilerleyin. Havada çift zıplama (Double Jump) mekaniği içerir!
  - **Uçuş Modu (Flappy Stili):** Rampadan havalanarak logolu kuleler/borular arasından flap mekaniğiyle süzülün.
- **Karakter Kostümleri ve Temalar:**
  - **3 Oynanabilir Kostüm:** Klasik Civciv, Gözlüklü Dedektif ve Ay-Yıldızlı Milli Takım Futbolcusu.
  - **4 Renk Paleti:** Klasik Canlı (7 renk), Canlı Pop (5 renk), Neon Cyber (5 renk) ve Tam Pastel Dünya Modu (pastel gökyüzü, adaçayı zemin, pastel gece).
  - **Konami Kodu:** Civcivin arkasında aktif palete uyumlu gökkuşağı izi (trail) oluşturur.
- **Rampa & Boşluk Mekaniği:** Rampaya çarpmak sizi havaya fırlatır. Rampayı es geçen veya atlayamayan oyuncu boşluğa düşerek elenir.
- **Skor & Tohum Dengesi:** `Net Skor = Mesafe Skoru + Tohum Skoru` (Standart tohum +15, yüksek tohum +25 puan).
- **Kişisel En İyi Skor:** Seanslar arasında kişisel rekorunuzu yerel olarak hafızada tutar.
- **Google Dino Hız Modeli:** Sürekli yumuşak ivmelenme (`ACCELERATION = 0.0018`) ve her 100 metrede bir milestone kutlaması (çan sesi, kıvılcımlar, gösterge parlaması).
- **Günlük Liderlik Tablosu & Güvenlik:** LocalStorage tabanlı Günün Top 10 sıralaması, leetspeak korumalı küfür filtresi (`Civciv#XXX`) ve gizli admin paneli (`Ctrl + Shift + A`).
- **Ekran Optimizasyonu:** 60Hz, 144Hz, 165Hz ve 240Hz monitörlerde takılmaları sıfırlayan VSync-quantized delta ve piksel hizalama.
- **Kullanım Kolaylıkları:** Oyunu duraklatma (`Escape`), hızlı yere inme (`↓` / `S`).

---

### 🚀 Bilgisayarda Nasıl Çalıştırılır?

Oyun modern JavaScript ES modüllerini (`import`/`export`) kullandığı için doğrudan `file://` ile çift tıklayarak açmak yerine yerel bir HTTP sunucusu üzerinden çalıştırılmalıdır.

#### Kolay Başlatma (Windows - Sıfır Kurulum)
Klasördeki **`oyunu_baslat.bat`** dosyasına çift tıklayın. Bilgisayarınızda Python, Node.js veya yerel Windows PowerShell'i otomatik tespit ederek oyunu varsayılan tarayıcınızda açar.

#### 1. Yöntem: Python ile Çalıştırma
```bash
python -m http.server 8000
```
Tarayıcınızdan `http://localhost:8000` adresini açın.

#### 2. Yöntem: Node.js / npx ile Çalıştırma
```bash
npx serve .
```

#### 3. Yöntem: VS Code Live Server ile
- Proje klasörünü **VS Code** ile açın.
- **Live Server** eklentisiyle `index.html` dosyasına sağ tıklayıp **"Open with Live Server"** seçin.

### ⌨️ Tuş Kontrolleri
| İşlem | Tuş / Giriş |
|---|---|
| **Zıpla / Çift Zıpla / Uç** | `Space` veya `Fare Tıklaması / Dokunma` |
| **Hızlı Yere İnme (Fast Fall)** | `↓` (Aşağı Ok) veya `S` |
| **Kostüm Değiştir** | `C` veya Menüde `S` / Kostüm Kartlarına Tıkla |
| **Renk Paleti Değiştir** | `P` veya `1` - `4` (4: Tam Pastel Modu) |
| **Duraklat / Devam Et** | `Escape` |
| **God Mode (Ölümsüzlük)** | `Ctrl + G` |
| **Admin Paneli** | `Ctrl + Shift + A` (veya `Ctrl + A + D`) |
| **Konami Kodu (Gökkuşağı İzi)** | `↑ ↑ ↓ ↓ ← → ← → B A` |