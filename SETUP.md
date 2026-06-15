# Tamkeen — Setup Guide
**tamkeen.durodola.africa**

---

## Step 1: Install Dependencies

```bash
cd /Users/user/Desktop/Tamkeen
npm install
```

---

## Step 2: Set Up Supabase (Free)

1. Go to **https://supabase.com** → Create new project
2. Name it: `tamkeen`
3. Choose any region (Frankfurt is closest to Nigeria)
4. Copy your **Project URL** and **anon key** from Settings → API

5. Go to **SQL Editor** → paste the entire contents of `supabase-schema.sql` → Run

6. After the schema is set up, run these two SQL lines:
   ```sql
   -- Create your first admin invite code
   INSERT INTO public.invite_codes (code, is_used) VALUES ('TAMKEEN1', false);
   
   -- After you register with the code, make yourself admin:
   UPDATE public.users SET is_admin = true WHERE email = 'durodoladuro55@gmail.com';
   ```

---

## Step 3: Set Up Firebase (Free, for push notifications)

1. Go to **https://console.firebase.google.com** → New project
2. Name it: `tamkeen`
3. Add a **Web App** to the project
4. Copy the config object

5. Go to **Project Settings → Cloud Messaging** → Generate a **VAPID key** (Web Push certificates)
6. Copy the VAPID key

7. Update `public/firebase-messaging-sw.js` with your real Firebase config values

---

## Step 4: Get Google Gemini API Key (Free)

1. Go to **https://makersuite.google.com/app/apikey**
2. Create an API key (free tier: 1M tokens/month)

---

## Step 5: Create .env file

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

Then edit `.env`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=tamkeen.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tamkeen
VITE_FIREBASE_STORAGE_BUCKET=tamkeen.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=12345...
VITE_FIREBASE_APP_ID=1:12345:web:abc...
VITE_FIREBASE_VAPID_KEY=BNy...
VITE_GEMINI_API_KEY=AIza...
```

---

## Step 6: Run Locally to Test

```bash
npm run dev
```

Open `http://localhost:5173`

1. Use invite code `TAMKEEN1` to register
2. After registering, run the SQL to make yourself admin
3. Test all features

---

## Step 7: Build for Production

```bash
npm run build
```

This creates a `dist/` folder.

---

## Step 8: Deploy to Shared Hosting

Upload the entire contents of the `dist/` folder to your hosting via FTP/cPanel.

**For `tamkeen.durodola.africa`:**
1. In cPanel, create a **subdomain**: `tamkeen.durodola.africa`
2. Point it to a folder, e.g., `public_html/tamkeen/`
3. Upload all files from `dist/` to that folder via FTP or cPanel File Manager
4. Create a `.htaccess` file in that folder with this content:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

This ensures React Router works correctly (all routes serve index.html).

---

## Step 9: First Use

1. Visit `tamkeen.durodola.africa`
2. Log in with your account
3. Go to Settings → Enable Notifications
4. Go to Admin → Generate invite codes for family & friends
5. Share codes via WhatsApp

---

## App Icons

Generate icons (192×192 and 512×512 PNG) for the PWA:
- Use Canva or Figma to create icons with the Tamkeen triangle logo
- Navy (#1B4332) background + white/mint triangle
- Save as `public/icons/icon-192.png` and `public/icons/icon-512.png`
- Rebuild after adding icons

---

## Troubleshooting

**Push notifications not working:**
- Make sure the site is served over HTTPS (required for service workers)
- Check that `firebase-messaging-sw.js` is at the root (served at `/firebase-messaging-sw.js`)
- Update the Firebase config in that file with your real values

**Supabase RLS errors:**
- Make sure you ran the full schema SQL including all the `create policy` statements
- Check the Supabase Dashboard → Authentication → Users to confirm your account exists

**Prayer times not loading:**
- The Aladhan API is free and requires no key. Check your internet connection.
- Times are cached for the day in localStorage

---

## Cost Summary

| Service | Cost |
|---------|------|
| Supabase (up to 500MB, 50K MAU) | **Free** |
| Firebase FCM | **Free** |
| Google Gemini API (1M tokens/month) | **Free** |
| Aladhan Prayer Times API | **Free** |
| Al-Quran Cloud API | **Free** |
| Ahadith API | **Free** |
| Shared hosting (you already own it) | **$0 extra** |

**Total: $0/month for 20 users**
