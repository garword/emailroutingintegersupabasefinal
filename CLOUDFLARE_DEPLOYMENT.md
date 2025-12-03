# Email Routing Manager - Cloudflare Workers Version

Website Email Routing Manager yang di-deploy di Cloudflare Workers dengan menggunakan D1 Database (gratis).

## 🚀 Features

- ✅ Email Routing Management
- ✅ Cloudflare API Integration
- ✅ D1 Database (Free)
- ✅ KV Storage untuk Caching
- ✅ Responsive Design (Mobile & Desktop)
- ✅ Multi-language Support (ID/EN)
- ✅ Secure API dengan Token

## 📋 Persyaratan

- Node.js 18+
- Cloudflare Account (gratis)
- Wrangler CLI

## 🛠️ Setup Awal

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Wrangler

```bash
npm install -g wrangler
wrangler login
```

### 3. Create D1 Database

```bash
npm run cf:db:create
```

Catat `database_id` yang diberikan, update di `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "email-routing-db"
database_id = "YOUR_DATABASE_ID"  # Update ini
```

### 4. Initialize Database Schema

```bash
npm run cf:db:init
```

### 5. Setup Environment Variables

Buat file `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-worker-domain.workers.dev
```

## 🏃 Development

```bash
# Local development dengan Wrangler
npm run cf:dev

# Atau dengan Next.js local dev (untuk frontend)
npm run dev
```

## 🚀 Deployment

### Deploy ke Cloudflare Workers

```bash
npm run cf:deploy
```

Setelah deployment berhasil, copy URL yang diberikan dan use sebagai API endpoint.

## 📝 API Endpoints

### Config Management

**GET** `/api/cloudflare/config` - Get konfigurasi
**POST** `/api/cloudflare/config` - Save konfigurasi

### Email Routing

**GET** `/api/email-routing` - List semua email routings
**POST** `/api/email-routing` - Create email routing baru
**DELETE** `/api/email-routing/:id` - Delete email routing

### Cloudflare Zones

**GET** `/api/cloudflare/zones` - List zones dari Cloudflare

## 🔐 Security

- API Token disimpan di D1 Database (encrypted)
- Semua request melalui HTTPS
- CORS protection
- Rate limiting built-in di Cloudflare

## 💾 Database Schema

### cloudflare_config
```sql
- id (INTEGER PRIMARY KEY)
- api_token
- account_id
- d1_database
- worker_api
- kv_storage
- destination_emails (JSON)
- created_at / updated_at
```

### email_routings
```sql
- id (UUID PRIMARY KEY)
- zone_id
- zone_name
- alias_part
- full_email
- destination
- is_active
- created_at / updated_at
```

## 📊 Monitoring

Lihat logs di Cloudflare Dashboard:
1. Workers → Your Worker → Logs

## 🎯 Next Steps

1. Deploy frontend ke Cloudflare Pages (opsional)
2. Setup custom domain
3. Configure email forwarding rules
4. Test dengan Cloudflare API

## 📚 Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [D1 Database Documentation](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)

## 📧 Login Credentials (Demo)

```
Username: windaa
Password: cantik
```

## 📄 License

MIT
