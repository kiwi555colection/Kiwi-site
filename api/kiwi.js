// Vercel Serverless Function — dynamic share page per KIWI.
// URL: /api/kiwi?id=42
// Returns an HTML page whose OG tags point to that kiwi's IPFS image,
// so X/Twitter/Discord show the correct kiwi when the link is shared.
// A human who opens it gets redirected to the main site.

const IPFS_CID = 'bafybeibryx5lqp5qw2jeku7yc2szcid37bvzl47deba5o3u7feqhzvk3zy';
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

// Minimal trait lookup — loaded from manifest.json bundled with the deployment.
// We import it directly so the function has the data without a network call.
import manifest from '../manifest.json' assert { type: 'json' };

export default function handler(req, res) {
  const id = parseInt(req.query.id, 10);

  // Validate
  if (!id || id < 1 || id > 555) {
    res.setHeader('Location', '/');
    res.status(302).end();
    return;
  }

  // Find this kiwi's traits
  const kiwi = manifest.find(k => k.id === id) || {};
  const body = kiwi.body || '';
  const eye = kiwi.eye || '';
  const hat = kiwi.hat || '';
  const accessory = kiwi.accessory || '';

  const pad = String(id).padStart(3, '0');
  const imageURL = `${IPFS_GATEWAY}${IPFS_CID}/${id}.png`;
  const title = `KIWI #${pad}`;
  const desc = `Body: ${body} · Eye: ${eye} · Hat: ${hat} · Accessory: ${accessory}`;

  // The site's own URL (so "open" sends humans to the homepage)
  const host = req.headers.host || 'localhost';
  const proto = host.includes('localhost') ? 'http' : 'https';
  const siteURL = `${proto}://${host}/`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — KIWI Collection</title>

  <!-- Open Graph (Facebook, Discord, WhatsApp) -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title} — The ones who stayed">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${imageURL}">
  <meta property="og:image:width" content="1024">
  <meta property="og:image:height" content="1024">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title} — The ones who stayed">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${imageURL}">

  <!-- Send human visitors to the homepage after a beat -->
  <meta http-equiv="refresh" content="0; url=${siteURL}">
  <style>
    body { background:#B8CD9E; color:#3E2314; font-family:sans-serif;
           display:flex; flex-direction:column; align-items:center;
           justify-content:center; height:100vh; margin:0; text-align:center; }
    img { width:300px; height:300px; image-rendering:pixelated;
          border:4px solid #3E2314; }
    a { color:#3E2314; margin-top:20px; }
  </style>
</head>
<body>
  <img src="${imageURL}" alt="${title}">
  <h1>${title}</h1>
  <p>${desc}</p>
  <a href="${siteURL}">Enter the flock →</a>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
  res.status(200).send(html);
}
