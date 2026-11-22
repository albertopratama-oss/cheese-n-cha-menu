# CHEESE N’ CHA — paket website

Ini paket kode sumber, belum online. Stack: React + Vite + Supabase.

## Supabase
1. Buka proyek `cheese-n-cha-menu` > SQL Editor > New query.
2. Salin seluruh `supabase-setup.sql`, tempel, lalu Run. Jangan hapus tabel/produk lama.
3. Authentication > Users > Add user. Buat akun admin dengan email dan password kuat.
4. Salin User UID akun tersebut. Di SQL Editor jalankan:
   `insert into public.admins(user_id) values ('GANTI_DENGAN_USER_UID');`
   Ganti teks itu dengan UID milik Anda.

## Deploy
Folder ini perlu dibuild dan diunggah ke Netlify (atau dihubungkan melalui GitHub).
Build command `npm run build`, publish directory `dist`.
Tambahkan environment variables di Netlify:
- `VITE_SUPABASE_URL` = Project URL
- `VITE_SUPABASE_ANON_KEY` = Publishable key / anon public key
- `VITE_WHATSAPP_NUMBER` = `6282221277210`
Setelah mengubah environment variables, deploy ulang.

## Keamanan dan fitur
Katalog publik membaca `public.products`; keranjang dan checkout WhatsApp tersedia; admin login memakai Supabase Auth; admin terdaftar pada tabel `admins` dapat CRUD produk dan upload gambar ke bucket `product-images`. RLS membatasi perubahan data ke admin.
Jangan pernah masukkan service_role key, secret key, atau database password ke website.
Foto lama hanya muncul jika `image_url` pada baris produk berisi URL publik foto tersebut. Jika URL foto sudah disimpan di tabel, website akan menampilkannya.
