const fs = require('fs');
const path = require('path');

module.exports = function handler(req, res) {
  const id = parseInt(req.query.id, 10);
  const result = { id: id, checks: {} };

  // Check 1: manifest file exists
  const manifestPath = path.join(process.cwd(), 'manifest.json');
  result.checks.manifestPath = manifestPath;
  result.checks.manifestExists = fs.existsSync(manifestPath);

  // Check 2: try read manifest
  try {
    const raw = fs.readFileSync(manifestPath, 'utf8');
    result.checks.manifestSize = raw.length;
    const data = JSON.parse(raw);
    result.checks.manifestCount = data.length;
    result.checks.firstItem = data[0];
    const kiwi = data.find(function(k) { return k.id === id; });
    result.checks.foundKiwi = kiwi || 'NOT FOUND';
  } catch (e) {
    result.checks.error = e.message;
  }

  // Check 3: current working directory contents
  try {
    result.checks.cwd = process.cwd();
    result.checks.cwdFiles = fs.readdirSync(process.cwd()).slice(0, 20);
  } catch (e) {
    result.checks.cwdError = e.message;
  }

  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify(result, null, 2));
};
