const { test } = require('node:test');
const assert = require('node:assert/strict');
const { applyIssue } = require('./issue-to-csv.js');

const HEADER = 'city,lat,lon,is_official,website,email,facebook,instagram,bluesky,whatsapp,cara,description,founded,chapter_date,deutschlandtreffen';
const CSV = [
  HEADER,
  'Aachen,50.7766,6.0834,1,https://www.usk-ac.de,,,@usk.aachen,,,,,,,',
  'Ulm,48.4011,9.9876,0,,urbansketchersulm@gmail.com,,@ulm_usk,,,,,,,',
].join('\n') + '\n';

const NEW_CITY_LABELS = ['Stadt', 'Breitengrad (lat)', 'Längengrad (lon)', 'Offizielles Chapter?', 'Treffpunkt & Zeiten', 'Website', 'E-Mail', 'Facebook', 'Instagram', 'Bluesky', 'WhatsApp', 'Cara', 'Gründungsdatum', 'Chapter-Anerkennung'];

// Renders an issue body the way GitHub issue forms do; omitted fields read "_No response_".
function issueBody(values) {
  return NEW_CITY_LABELS
    .map(label => `### ${label}\n\n${values[label] ?? '_No response_'}`)
    .join('\n\n');
}

function rowOf(csv, city) {
  return csv.split('\n').find(line => line.startsWith(city + ','));
}

test('new city is inserted in alphabetical order', () => {
  const result = applyIssue(CSV, {
    labels: ['neue-stadt'],
    body: issueBody({ Stadt: 'Bonn', 'Breitengrad (lat)': '50.73', 'Längengrad (lon)': '7.10', Instagram: '@usk_bonn' }),
  });
  assert.deepEqual(result.csv.trim().split('\n').map(l => l.split(',')[0]), ['city', 'Aachen', 'Bonn', 'Ulm']);
  assert.equal(result.city, 'Bonn');
  assert.equal(result.isNew, true);
});

test('update replaces given fields, keeps blank ones, and clears "entfernen"', () => {
  const result = applyIssue(CSV, {
    labels: ['aktualisierung'],
    body: issueBody({ Stadt: 'ulm', 'E-Mail': 'entfernen', Website: 'https://usk-ulm.de' }),
  });
  assert.equal(rowOf(result.csv, 'Ulm'), 'Ulm,48.4011,9.9876,0,https://usk-ulm.de,,,@ulm_usk,,,,,,,');
  assert.equal(result.isNew, false);
});

test('update of an unknown city is an error', () => {
  const result = applyIssue(CSV, { labels: ['aktualisierung'], body: issueBody({ Stadt: 'Atlantis' }) });
  assert.equal(result.error, 'Stadt "Atlantis" nicht gefunden');
});

test('new city without coordinates is an error', () => {
  const result = applyIssue(CSV, { labels: ['neue-stadt'], body: issueBody({ Stadt: 'Bonn' }) });
  assert.equal(result.error, 'Koordinaten fehlen');
});
