# Winter Arc

A 90-day tracker for Health, Diet, Routine, Gym and Data Engineering focus. Local-first PWA (React + Vite + TypeScript + Framer Motion). All data is stored on the device (localStorage), no account or backend.

## Run locally
```
npm install
npm run dev
```

## Deploy on Vercel (via Git)
1. Push this folder to a GitHub repo (this folder is the repo root).
2. Go to vercel.com > Add New > Project > import the repo.
3. Framework preset: Vite (auto-detected). Build: `npm run build`. Output: `dist`. Click Deploy.
4. Open the Vercel URL on your phone: iPhone Safari > Share > Add to Home Screen (Android Chrome > Install app).

Every `git push` to the main branch redeploys automatically.

## Notes
- Each device/browser keeps its own data. Use the same installed app on your phone.
- The service worker only registers over HTTPS (Vercel gives HTTPS).
