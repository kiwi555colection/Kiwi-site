module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(JSON.stringify({
    query: req.query,
    url: req.url,
    id_raw: req.query.id,
    id_parsed: parseInt(req.query.id, 10)
  }, null, 2));
};
