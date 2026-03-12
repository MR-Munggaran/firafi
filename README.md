firafi 💰
firafi adalah aplikasi manajemen keuangan personal dan bersama (couple) yang dirancang untuk membantu individu maupun pasangan mengelola anggaran, melacak transaksi, dan mencapai target keuangan bersama secara transparan.

✨ Fitur Utama
Autentikasi Aman: Registrasi dan login menggunakan Supabase Auth dengan dukungan session server-side.

Sistem Pasangan (Couple System): Hubungkan akun Anda dengan pasangan menggunakan kode undangan unik untuk berbagi dompet, anggaran, dan target keuangan.

Manajemen Dompet (Wallets): Buat dan pantau saldo dari berbagai sumber dana (Tunai, Bank, e-Wallet).

Penyusunan Anggaran (Budgeting): Rencanakan pengeluaran bulanan dan alokasikan dana menggunakan preset otomatis.

Pelacakan Transaksi: Catat pemasukan dan pengeluaran secara detail dengan kategori dan filter.

Target Keuangan (Goals): Tetapkan target menabung dan pantau progres pencapaiannya bersama pasangan.

Momen (Moments): Simpan catatan atau foto momen penting terkait aktivitas keuangan Anda.

Dashboard Informatif: Ringkasan saldo total, pengeluaran terbaru, dan status anggaran dalam satu tampilan.

🚀 Teknologi
Framework: Next.js 15 (App Router).

Bahasa: TypeScript.

Database & ORM: PostgreSQL dengan Drizzle ORM.

Backend as a Service: Supabase (Auth, Database, Storage).

Styling: Tailwind CSS & shadcn/ui.

Validasi: Zod.

Runtime: Bun.

🛠️ Instalasi
Clone repositori:

Bash
git clone https://github.com/username/firafi.git
cd firafi
Instal dependensi:

Bash
bun install
Konfigurasi Environment:
Buat file .env di akar direktori dan isi dengan kredensial Supabase serta database Anda:

Code snippet
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_postgresql_url
Push Schema Database:

Bash
bun x drizzle-kit push
Jalankan aplikasi:

Bash
bun dev
Buka http://localhost:3000 di browser Anda.

📖 Alur Penggunaan
Daftar & Login: Buat akun baru dan lengkapi profil Anda pada tahap onboarding.

Hubungkan Pasangan: Buka menu Settings, salin kode undangan Anda dan berikan ke pasangan, atau masukkan kode pasangan Anda untuk sinkronisasi data.

Setup Keuangan: Tambahkan dompet awal Anda di menu Wallets dan buat rencana anggaran bulanan di menu Budget.

Mulai Mencatat: Gunakan fitur Quick Add di Dashboard untuk mencatat transaksi harian dengan cepat.
