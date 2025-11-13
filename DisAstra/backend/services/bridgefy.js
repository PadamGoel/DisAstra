const axios = require('axios');

const BRIDGEFY_API_URL = process.env.BRIDGEFY_API_URL || '';
const BRIDGEFY_API_KEY = process.env.BRIDGEFY_API_KEY;
const BRIDGEFY_API_HEADER = process.env.BRIDGEFY_API_HEADER || 'x-api-key';

async function broadcastSOS(sosPayload) {
  // If BRIDGEFY_API_URL is configured, attempt to call a Bridgefy cloud endpoint
  if (!BRIDGEFY_API_KEY) {
    console.warn('Bridgefy API key not configured; skipping broadcast');
    return { ok: false, reason: 'no-api-key' };
  }

  if (!BRIDGEFY_API_URL) {
    // No cloud URL configured; in many Bridgefy setups the SDK runs on-device and does not use a cloud API.
    // Return ok so callers can continue; mobile clients should use Bridgefy SDK to broadcast over mesh.
    console.info('Bridgefy API URL not set. Expect device SDK to handle mesh broadcasts.');
    return { ok: true, reason: 'sdk-only' };
  }

  try {
    const headers = {
      [BRIDGEFY_API_HEADER]: BRIDGEFY_API_KEY,
      'Content-Type': 'application/json'
    };

    // Example cloud endpoint path: /v1/broadcasts (this is hypothetical; adapt to your cloud proxy)
    const resp = await axios.post(`${BRIDGEFY_API_URL}/v1/broadcasts`, sosPayload, { headers });
    return { ok: true, data: resp.data };
  } catch (err) {
    console.error('Error broadcasting via Bridgefy cloud:', err?.response?.data || err.message || err);
    return { ok: false, reason: err.message };
  }
}

module.exports = { broadcastSOS };
