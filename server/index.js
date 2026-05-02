const express = require('express');
const bodyParser = require('body-parser');
const passportIndex = require('../data/passportIndex.json');

const app = express();
app.use(bodyParser.json());

app.post('/api/visa', async (req, res) => {
  const { passport, destination } = req.body;

  if (!passport || !destination) {
    return res.status(400).json({ error: 'Passport and destination are required.' });
  }

  const passportData = passportIndex[passport.toUpperCase()];
  if (!passportData) {
    return res.status(404).json({ error: `No data found for passport: ${passport}` });
  }

  const visaInfo = passportData[destination.toUpperCase()];
  if (!visaInfo) {
    return res.status(404).json({ error: `No visa information found for destination: ${destination}` });
  }

  let status = 'check_embassy';
  if (visaInfo.status === 'visa free') status = 'visa_free';
  else if (visaInfo.status === 'visa on arrival') status = 'on_arrival';
  else if (visaInfo.status === 'e-visa') status = 'e_visa';
  else if (visaInfo.status === 'visa required') status = 'visa_required';
  else if (visaInfo.status === 'eta') status = 'eta';

  res.json({
    status,
    days: visaInfo.days ?? null,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});