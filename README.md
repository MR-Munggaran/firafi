# firafi 💰

**firafi** adalah aplikasi manajemen keuangan personal dan bersama (*couple*) yang dirancang untuk membantu individu maupun pasangan mengelola anggaran, melacak transaksi, dan mencapai target keuangan bersama secara transparan.

## ✨ Fitur Utama

* **Autentikasi Aman**: Registrasi dan login menggunakan Supabase Auth dengan dukungan session server-side.
* **Sistem Pasangan (Couple System)**: Hubungkan akun Anda dengan pasangan menggunakan kode undangan unik untuk berbagi dompet, anggaran, dan target keuangan.
* **Manajemen Dompet (Wallets)**: Buat dan pantau saldo dari berbagai sumber dana seperti Tunai, Bank, atau e-Wallet.
* **Penyusunan Anggaran (Budgeting)**: Rencanakan pengeluaran bulanan dan alokasikan dana menggunakan preset otomatis.
* **Pelacakan Transaksi**: Catat pemasukan dan pengeluaran secara detail dengan kategori dan filter.
* **Target Keuangan (Goals)**: Tetapkan target menabung dan pantau progres pencapaiannya bersama pasangan.
* **Momen (Moments)**: Simpan catatan atau foto momen penting terkait aktivitas keuangan Anda bersama pasangan.
* **Dashboard Informatif**: Ringkasan saldo total, pengeluaran terbaru, dan status anggaran dalam satu tampilan.

## 🚀 Teknologi

* **Framework**: [Next.js 15 (App Router)](https://nextjs.org/).
* **Bahasa**: [TypeScript](https://www.typescriptlang.org/).
* **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) dengan [Drizzle ORM](https://orm.drizzle.team/).
* **Backend as a Service**: [Supabase](https://supabase.com/) (Auth, Database, Storage).
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/).
* **Validasi**: [Zod](https://zod.dev/).
* **Runtime**: [Bun](https://bun.sh/).

## 🛠️ Instalasi

1.  **Clone repositori**:
    ```bash
    git clone [https://github.com/username/firafi.git](https://github.com/username/firafi.git)
    cd firafi
    ```

2.  **Instal dependensi**:
    ```bash
    bun install
    ```

3.  **Konfigurasi Environment**:
    Buat file `.env` di akar direktori dan isi dengan kredensial Supabase serta database Anda:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    DATABASE_URL=your_postgresql_url
    ```

4.  **Push Schema Database**:
    ```bash
    bun x drizzle-kit push
    ```

5.  **Jalankan aplikasi**:
    ```bash
    bun dev
    ```
    Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📖 Alur Penggunaan

1.  **Daftar & Login**: Buat akun baru dan lengkapi profil Anda pada tahap onboarding.
2.  **Hubungkan Pasangan**: Buka menu *Settings*, salin kode undangan Anda dan berikan ke pasangan, atau masukkan kode pasangan Anda untuk sinkronisasi data.
3.  **Setup Keuangan**: Tambahkan dompet awal Anda di menu *Wallets* dan buat rencana anggaran bulanan di menu *Budget*.
4.  **Mulai Mencatat**: Gunakan fitur *Quick Add* di Dashboard untuk mencatat transaksi harian dengan cepat.
