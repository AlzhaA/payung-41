# Payung 41 (Forty-One Card Game)

Game kartu berbasis web klasik **"Payung 41"** (*Yang payung payung aja*) dengan 1 Pemain melawan 3 CPU (AI) berpenampilan mewah (*Luxury Casino Emerald & Gold Theme*).

![Payung 41 Logo](assets/logo.png)

---

## 🎴 Aturan Permainan (Rules)

1. **Nilai Poin Kartu**:
   - **Kartu As (Ace)**: **11 Poin**
   - **Kartu Gambar (King, Queen, Jack) & Angka 10**: **10 Poin**
   - **Kartu Angka (2 s/d 9)**: Poin sesuai angka pada kartu (**2 s/d 9**)

2. **Tujuan & Perhitungan Skor**:
   - Setiap pemain memegang **4 kartu** di tangan.
   - Skor dihitung dari total nilai kartu pada **kembang (suit) yang sama** (♠ Sekop, ♥ Hati, ♣ Keriting, ♦ Wajik).
   - Jika memiliki kartu dengan kembang berbeda, kartu tersebut menjadi **pengurang (penalti)** dari kembang utamamu:
     $$\text{Skor Akhir} = \text{Total Kembang Utama} - \text{Total Kembang Lain}$$
   - **Kemenangan Mutlak (41 Poin)**:
     Memiliki 4 kartu dengan kembang yang sama bernilai As (11) + tiga kartu bernilai 10 (K/Q/J/10) = $11 + 10 + 10 + 10 = \mathbf{41\text{ Poin}}$! (Pemain langsung dinyatakan menang seketika).

3. **Alur Giliran Permainan**:
   - **Langkah 1 (Ambil Kartu / Draw)**:
     - Ambil 1 kartu dari Deck tertutup, **ATAU**
     - Ambil kartu teratas dari Tumpukan Buangan terbuka.
     - Kartu di tangan sementara menjadi **5 kartu**.
   - **Langkah 2 (Buang Kartu / Discard)**:
     - Pilih 1 kartu yang paling tidak menguntungkan untuk dibuang ke tumpukan buangan terbuka.
     - Kartu di tangan kembali menjadi **4 kartu**.
   - **Akhir Permainan**:
     - Salah satu pemain mencapai **41 Poin** (Instant Win), **ATAU**
     - Kartu di Deck telah habis, **ATAU**
     - Pemain memilih **Tutup (Knock)**.
     - Semua kartu dibuka dan pemenang ditentukan berdasarkan poin tertinggi!

---

## 🚀 Cara Menjalankan Game

Buka file [index.html](file:///c:/Users/alzha/Documents/Antigravity_Project/Card_game/index.html) langsung di browser pilihan Anda (Google Chrome, Microsoft Edge, Firefox, dll), atau gunakan local server:

```bash
# Menggunakan Python
cd Card_game
python -m http.server 8080

# Lalu buka di browser:
http://localhost:8080
```

---

## ✨ Fitur Unggulan

- 🎮 **1 Player vs 3 CPU Cerdas**: Budi, Siti, dan Anton dengan kecerdasan buatan dalam memilih kembang target, mengambil kartu buangan, dan membuang kartu penalti.
- 🔀 **Animasi 3D Card Shuffle & Sound**: Animasi pengocokan kartu realistis (riffle & cascade effect) dengan efek audio desiran kartu Web Audio API sebelum kartu dibagikan di setiap awal ronde atau saat menekan tombol "Kocok Kartu".
- 🃏 **Animasi Visual Pembagian Kartu (Dealing Animation Sequence)**:
  - Setelah kartu selesai dikocok, 16 kartu akan **terbang satu per satu secara berurutan melintasi meja** dari tumpukan tengah ke tangan masing-masing 4 pemain (Kamu, Budi, Siti, Anton).
  - Kartu pemain manusia akan membalik terbuka (*face-up reveal*), sedangkan kartu CPU mendarat tertutup dengan rotasi dinamis dan bunyi desiran *deal sound*.
  - Diakhiri dengan 1 kartu pembuka yang melayang dan membuka tumpukan buangan.
- 📥 **Animasi Ambil Cangkulan (Flying Draw Animation)**:
  - Saat Anda atau CPU menarik kartu dari Deck (*cangkul*) atau mengambil kartu buangan, kartu akan **terbang melayang secara 3D dari tumpukan ke tangan pemain** dengan efek flip dan pembukaan kartu yang mulus.
- 🚀 **Animasi Visual Kartu Dibuang (Flying Discard Animation)**:
  - Kartu yang dibuang oleh Player atau CPU akan melayang secara 3D (*flying trajectory arc*) dari tangan pemain langsung menuju tumpukan buangan.
  - Tumpukan buangan secara rapi hanya menampilkan kartu aktif terbaru (*clean single top card*) dengan efek *landing pop & glow*, tanpa ada kartu bertumpuk ke bawah yang menghalangi layar.
  - Indikator badge jelas siapa yang terakhir membuang kartu (contoh: **Budi: 9♥**).
- 🎨 **Tampilan Visual Casino Mewah**: Desain meja felt hijau zamrud, aksen emas berkilau, efek glassmorphism, dan animasi kartu interaktif.
- 🔊 **Web Audio Synthesizer**: Efek suara dinamis untuk shuffle, pembagian kartu, pengambilan, pembuangan, alert giliran, knock, dan kembang api kemenangan tanpa memerlukan file MP3 eksternal.
- 📊 **Live Telemetry & Score Breakdown**: Indikator real-time poin tiap kembang (&spades;, &hearts;, &clubs;, &diams;) dan kembang dominan.
- 🏆 **Scoreboard & Papan Peringkat**: Riwayat skor akumulatif antar ronde dan dialog hasil pertandingan lengkap dengan preview kartu semua pemain.
- 📱 **Desain 100% Responsif (Mobile, Tablet, & Desktop)**:
  - Tampilan otomatis beradaptasi dengan mulus pada layar smartphone (*portrait & landscape*), tablet, hingga layar monitor desktop besar.
  - Pada layar HP/mobile, tata letak otomatis berubah menjadi format 3-Tier Casino (*3 CPU di deretan atas, Meja Tengah penuh, dan HUD Kontrol Pemain di bawah*) sehingga tidak ada kartu atau tombol yang terpotong.
  - Menggunakan unit `100dvh` dan `clamp()` presisi untuk mencegah terpotong oleh navbar/address bar browser HP.
