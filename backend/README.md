Backend setup
-------------

1. Copy `.env` and set `MONGO_URI`, `JWT_SECRET`, and `BRIDGEFY_API_KEY`.
2. Install dependencies:

```powershell
cd backend
npm install
```

3. Start the server:

```powershell
npm run dev
```

Notes on Bridgefy integration:
- The Bridgefy key is read from `BRIDGEFY_API_KEY` in `.env`.
- If you have a Bridgefy Cloud/Proxy URL, set `BRIDGEFY_API_URL` and `BRIDGEFY_API_HEADER` in `.env`.
- Mobile devices using the Bridgefy SDK should broadcast over mesh directly; the backend will attempt a cloud broadcast only if `BRIDGEFY_API_URL` is set.
