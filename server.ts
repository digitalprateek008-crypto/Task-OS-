import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- 1. Health & Config Diagnostic Route ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    integrations: {
      meta: {
        hasAppId: Boolean(process.env.META_APP_ID),
        hasAppSecret: Boolean(process.env.META_APP_SECRET),
        configured: Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET),
      },
      google: {
        hasClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
        hasClientSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
        configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      },
      supabase: {
        hasUrl: Boolean(process.env.VITE_SUPABASE_URL),
        hasKey: Boolean(process.env.VITE_SUPABASE_ANON_KEY),
      },
    },
  });
});

// --- 2. Meta OAuth & Marketing API Endpoints ---
app.get('/api/auth/meta/url', (req, res) => {
  const appId = process.env.META_APP_ID;
  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const redirectUri = `${appUrl}/api/auth/meta/callback`;
  const clientId = req.query.clientId || '';

  if (!appId) {
    return res.status(400).json({
      error: 'META_APP_ID is not configured in .env',
      setupRequired: true,
      instructions:
        'Create an application on developers.facebook.com, add Marketing API product, and set META_APP_ID & META_APP_SECRET.',
    });
  }

  const scopes = [
    'ads_read',
    'read_insights',
    'pages_show_list',
    'instagram_basic',
    'instagram_manage_insights',
    'business_management',
  ].join(',');

  const state = JSON.stringify({ clientId, nonce: Date.now() });
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(state)}&response_type=code`;

  res.json({ authUrl, redirectUri });
});

app.get('/api/auth/meta/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    return res.send(`
      <html>
        <body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2 style="color: #dc2626;">Meta Authorization Failed</h2>
          <p>${error_description || error}</p>
          <a href="/" style="color: #0b1f3a; font-weight: bold;">Return to Agency OS</a>
        </body>
      </html>
    `);
  }

  if (!code) {
    return res.status(400).send('Missing authorization code');
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const redirectUri = `${appUrl}/api/auth/meta/callback`;

  try {
    // Exchange code for short-lived access token
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&client_secret=${appSecret}&code=${code}`;

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      throw new Error(tokenData.error.message);
    }

    // Success response window for popup closure
    res.send(`
      <html>
        <body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2 style="color: #486800;">Meta Connected Successfully</h2>
          <p>You can return to Agency OS. Loading your authorized ad accounts...</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'META_AUTH_SUCCESS', token: '${tokenData.access_token}' }, '*');
              setTimeout(() => window.close(), 1500);
            } else {
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    res.status(500).send(`Token exchange error: ${err.message}`);
  }
});

// Fetch accessible ad accounts for a token
app.post('/api/integrations/meta/accounts', async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    return res.status(400).json({ error: 'accessToken is required' });
  }

  try {
    const metaRes = await fetch(
      `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_id,currency,timezone_name,account_status&access_token=${accessToken}`
    );
    const data = await metaRes.json();
    if (data.error) throw new Error(data.error.message);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch campaigns & insights for an ad account
app.post('/api/integrations/meta/insights', async (req, res) => {
  const { accessToken, adAccountId, datePreset } = req.body;
  if (!accessToken || !adAccountId) {
    return res.status(400).json({ error: 'accessToken and adAccountId are required' });
  }

  const cleanAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;

  try {
    const fields = [
      'campaign_id',
      'campaign_name',
      'spend',
      'impressions',
      'reach',
      'frequency',
      'clicks',
      'inline_link_clicks',
      'cpc',
      'cpm',
      'ctr',
      'actions',
      'action_values',
      'purchase_roas',
    ].join(',');

    const url = `https://graph.facebook.com/v19.0/${cleanAccountId}/insights?level=campaign&fields=${fields}&date_preset=${datePreset || 'last_30d'}&access_token=${accessToken}`;
    const metaRes = await fetch(url);
    const data = await metaRes.json();

    if (data.error) throw new Error(data.error.message);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- 3. Google OAuth & APIs Endpoints ---
app.get('/api/auth/google/url', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const redirectUri = `${appUrl}/api/auth/google/callback`;
  const platform = req.query.platform || 'ga4'; // ga4, gsc, google_ads
  const agencyClientId = req.query.clientId || '';

  if (!clientId) {
    return res.status(400).json({
      error: 'GOOGLE_CLIENT_ID is not configured in .env',
      setupRequired: true,
      instructions:
        'Create OAuth 2.0 Client Credentials in Google Cloud Console with Google Analytics Admin/Data APIs, Search Console API, or Google Ads API enabled.',
    });
  }

  let scopes = ['openid', 'email', 'profile'];
  if (platform === 'ga4') {
    scopes.push('https://www.googleapis.com/auth/analytics.readonly');
  } else if (platform === 'google_search_console') {
    scopes.push('https://www.googleapis.com/auth/webmasters.readonly');
  } else if (platform === 'google_ads') {
    scopes.push('https://www.googleapis.com/auth/adwords');
  }

  const state = JSON.stringify({ agencyClientId, platform, nonce: Date.now() });
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(scopes.join(' '))}&access_type=offline&prompt=consent&state=${encodeURIComponent(state)}`;

  res.json({ authUrl, redirectUri });
});

app.get('/api/auth/google/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.send(`
      <html>
        <body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2 style="color: #dc2626;">Google Authorization Error</h2>
          <p>${error}</p>
          <a href="/" style="color: #0b1f3a; font-weight: bold;">Return to Agency OS</a>
        </body>
      </html>
    `);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(code),
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);

    res.send(`
      <html>
        <body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2 style="color: #486800;">Google Connected Successfully</h2>
          <p>Returning to Agency OS...</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', token: '${tokenData.access_token}' }, '*');
              setTimeout(() => window.close(), 1500);
            } else {
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    res.status(500).send(`Google Token exchange error: ${err.message}`);
  }
});

// --- 4. Development & Production Vite Server Integration ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Dev Mode: Mount Vite in middleware mode
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode: Serve static dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Agency OS Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
