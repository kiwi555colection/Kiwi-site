// Vercel Serverless Function — dynamic share page per KIWI.
// URL: /api/kiwi?id=42

const fs = require('fs');
const path = require('path');

let manifest = null;
function getManifest() {
  if (manifest) return manifest;
  try {
    const file = path.join(process.cwd(), 'manifest.json');
    manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    manifest = [];
  }
  return manifest;
}

module.exports = function handler(req, res) {
  const id = parseInt(req.query.id, 10);

  if (!id || id < 1 || id > 555) {
    res.writeHead(302, { Location: '/' });
    res.end();
    return;
  }

  const data = getManifest();
  const kiwi = data.find(function (k) { return k.id === id; }) || {};
  const body = kiwi.body || '';
  const eye = kiwi.eye || '';
  const hat = kiwi.hat || '';
  const accessory = kiwi.accessory || '';

  const pad = String(id).padStart(3, '0');
  const host = req.headers.host || 'localhost';
  const proto = host.indexOf('localhost') !== -1 ? 'http' : 'https';
  const siteURL = proto + '://' + host + '/';
  // Serve image dari domain sendiri (bukan IPFS) biar crawler X cepet fetch
  const imageURL = proto + '://' + host + '/img/nft/' + id + '.png';

  const title = 'KIWI #' + pad;
  const desc = 'Body: ' + body + ' \u00b7 Eye: ' + eye + ' \u00b7 Hat: ' + hat + ' \u00b7 Accessory: ' + accessory;

  // Detect crawler bots — kalau bot, serve HTML statis dengan meta tags aja (no redirect)
  // Kalau user biasa, baru redirect ke homepage
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  const isBot = /bot|crawler|spider|twitterbot|facebookexternalhit|slackbot|discordbot|whatsapp|telegram|linkedin/i.test(ua);

  const html = '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
'<head>\n' +
'  <meta charset="UTF-8">\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'  <title>' + title + ' \u2014 KIWI Collection</title>\n' +
'  <meta property="og:type" content="website">\n' +
'  <meta property="og:url" content="' + siteURL + 'api/kiwi?id=' + id + '">\n' +
'  <meta property="og:title" content="' + title + ' \u2014 The ones who stayed">\n' +
'  <meta property="og:description" content="' + desc + '">\n' +
'  <meta property="og:image" content="' + imageURL + '">\n' +
'  <meta property="og:image:width" content="1024">\n' +
'  <meta property="og:image:height" content="1024">\n' +
'  <meta property="og:image:type" content="image/png">\n' +
'  <meta name="twitter:card" content="summary_large_image">\n' +
'  <meta name="twitter:title" content="' + title + ' \u2014 The ones who stayed">\n' +
'  <meta name="twitter:description" content="' + desc + '">\n' +
'  <meta name="twitter:image" content="' + imageURL + '">\n' +
   (isBot ? '' : '  <script>window.location.replace("' + siteURL + '");</script>\n') +
'  <style>\n' +
'    body { background:#B8CD9E; color:#3E2314; font-family:sans-serif;\n' +
'           display:flex; flex-direction:column; align-items:center;\n' +
'           justify-content:center; min-height:100vh; margin:0; text-align:center; padding:20px; }\n' +
'    img { width:300px; height:300px; image-rendering:pixelated; border:4px solid #3E2314; }\n' +
'    a { color:#3E2314; margin-top:20px; }\n' +
'  </style>\n' +
'</head>\n' +
'<body>\n' +
'  <img src="' + imageURL + '" alt="' + title + '">\n' +
'  <h1>' + title + '</h1>\n' +
'  <p>' + desc + '</p>\n' +
'  <a href="' + siteURL + '">Enter the flock \u2192</a>\n' +
'</body>\n' +
'</html>';

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
  res.status(200).send(html);
};
