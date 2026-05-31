# Setup Supabase Storage untuk Installations

## Langkah-langkah Setup

### 1. Jalankan Migration Database

Jalankan migration untuk membuat table installations:

```bash
# Login ke Supabase dashboard
# https://frrwlbwfzcqiiswbtpym.supabase.co

# Buka SQL Editor dan jalankan file:
# database/migrations/005_create_installations_table.sql
```

Atau gunakan Supabase CLI:

```bash
supabase db push
```

### 2. Buat Storage Bucket

1. Buka Supabase Dashboard: https://frrwlbwfzcqiiswbtpym.supabase.co
2. Pilih project Anda
3. Klik **Storage** di sidebar kiri
4. Klik **New bucket**
5. Isi form:
   - **Name**: `installations`
   - **Public bucket**: ✅ (centang ini agar gambar bisa diakses publik)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/gif,image/webp`
6. Klik **Create bucket**

### 3. Setup Storage Policies

Setelah bucket dibuat, setup policies untuk keamanan:

```sql
-- Policy untuk authenticated users bisa upload
CREATE POLICY "Authenticated users can upload to installations"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'installations');

-- Policy untuk authenticated users bisa update
CREATE POLICY "Authenticated users can update installations files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'installations');

-- Policy untuk authenticated users bisa delete
CREATE POLICY "Authenticated users can delete installations files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'installations');

-- Policy untuk semua orang bisa read (public)
CREATE POLICY "Anyone can view installations files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'installations');
```

Atau setup via Dashboard:
1. Klik bucket **installations**
2. Klik tab **Policies**
3. Klik **New policy**
4. Pilih template **Allow public read access**
5. Tambahkan policy untuk INSERT, UPDATE, DELETE untuk authenticated users

### 4. Test Upload

1. Login ke aplikasi dengan salah satu admin:
   - admin / Nebulist2024!
   - admin2 / admin345
   - admin3 / admin345

2. Buka halaman **Installations**

3. Klik tombol **Upload Installation**

4. Isi form dan upload gambar:
   - Pilih gambar (JPG, PNG, GIF, WebP max 5MB)
   - Gambar akan otomatis diupload ke Supabase Storage
   - Preview akan muncul setelah upload berhasil

5. Submit form untuk membuat installation baru

6. Gambar akan muncul di card installation

## Troubleshooting

### Error: "Failed to upload images"

**Penyebab**: Bucket belum dibuat atau policies belum diset

**Solusi**:
1. Pastikan bucket `installations` sudah dibuat
2. Pastikan bucket diset sebagai **public**
3. Pastikan policies sudah diset dengan benar

### Error: "Invalid file type"

**Penyebab**: File yang diupload bukan format yang didukung

**Solusi**: Hanya upload file dengan format JPG, PNG, GIF, atau WebP

### Error: "File too large"

**Penyebab**: File lebih dari 5MB

**Solusi**: Compress gambar atau gunakan gambar dengan ukuran lebih kecil

### Gambar tidak muncul di card

**Penyebab**: 
- Bucket tidak public
- URL gambar salah
- CORS issue

**Solusi**:
1. Pastikan bucket `installations` diset sebagai **public**
2. Check console browser untuk error
3. Pastikan URL gambar valid: `https://frrwlbwfzcqiiswbtpym.supabase.co/storage/v1/object/public/installations/...`

## File Structure

```
lib/
  storage.ts              # Upload/delete functions
  api/
    installations.ts      # CRUD operations

components/
  installations/
    UploadInstallationModal.tsx  # Upload form dengan image upload

app/
  installations/
    page.tsx             # Display installations dengan gambar

database/
  migrations/
    005_create_installations_table.sql  # Table schema
```

## API Functions

### Upload Files
```typescript
import { uploadFiles } from "@/lib/storage";

const urls = await uploadFiles(files, "installations", "uploads");
// Returns: ["https://...url1", "https://...url2"]
```

### Delete Files
```typescript
import { deleteFiles } from "@/lib/storage";

await deleteFiles(urls, "installations");
```

### Validate Files
```typescript
import { isValidImageFile, isValidFileSize } from "@/lib/storage";

if (!isValidImageFile(file)) {
  console.error("Invalid file type");
}

if (!isValidFileSize(file, 5)) {
  console.error("File too large");
}
```

## Next Steps

1. ✅ Jalankan migration 005
2. ✅ Buat bucket `installations` di Supabase Storage
3. ✅ Setup storage policies
4. ✅ Test upload gambar
5. ✅ Verify gambar muncul di card

Setelah setup selesai, fitur upload gambar installations akan berfungsi dengan sempurna!
